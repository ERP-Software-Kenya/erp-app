import React, { useState, useCallback, useDeferredValue } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateSaleOrder } from '@/hooks/manager/useSalesOrders';
import { useCustomers } from '@/hooks/manager/useCustomers';
import { useLocations } from '@/hooks/manager/useLocations';
import type { CreateSaleOrderPayload } from '@/api/manager/sales-orders.api';

type Step = 1 | 2 | 3;

interface LineItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  discountPercent: number;
  taxPercent: number;
}

function fmt(n: number): string {
  return `₹${n.toLocaleString('en-IN')}`;
}

function lineTotal(item: LineItem): number {
  const base = item.unitPrice * item.quantity;
  const afterDisc = base * (1 - item.discountPercent / 100);
  return Math.round(afterDisc * (1 + item.taxPercent / 100));
}

function grandTotal(items: LineItem[]): number {
  return items.reduce((sum, item) => sum + lineTotal(item), 0);
}

// ── step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ step }: { step: Step }): React.ReactElement {
  const steps = [
    { n: 1, label: 'Customer' },
    { n: 2, label: 'Products' },
    { n: 3, label: 'Review' },
  ];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 16 }}>
      {steps.map((s, idx) => (
        <React.Fragment key={s.n}>
          <View style={{ alignItems: 'center' }}>
            <View style={{
              width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center',
              backgroundColor: step > s.n ? '#22c55e' : step === s.n ? '#3b74f5' : '#dde5f0',
            }}>
              <Text style={{ color: step >= s.n ? '#ffffff' : '#94a3b8', fontWeight: '700', fontSize: 13 }}>
                {step > s.n ? '✓' : s.n}
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: step === s.n ? '#3b74f5' : '#94a3b8', marginTop: 3, fontWeight: step === s.n ? '700' : '400' }}>
              {s.label}
            </Text>
          </View>
          {idx < steps.length - 1 && (
            <View style={{ flex: 1, height: 2, backgroundColor: step > s.n ? '#22c55e' : '#dde5f0', marginHorizontal: 8, marginBottom: 16 }} />
          )}
        </React.Fragment>
      ))}
    </View>
  );
}

// ── step 1: customer & location ───────────────────────────────────────────────

function Step1({
  isWalkIn, setIsWalkIn,
  walkInName, setWalkInName,
  selectedCustomerId, setSelectedCustomerId,
  selectedCustomerName, setSelectedCustomerName,
  selectedLocationId, setSelectedLocationId,
  selectedLocationName, setSelectedLocationName,
  onNext,
}: {
  isWalkIn: boolean; setIsWalkIn: (v: boolean) => void;
  walkInName: string; setWalkInName: (v: string) => void;
  selectedCustomerId: string; setSelectedCustomerId: (v: string) => void;
  selectedCustomerName: string; setSelectedCustomerName: (v: string) => void;
  selectedLocationId: string; setSelectedLocationId: (v: string) => void;
  selectedLocationName: string; setSelectedLocationName: (v: string) => void;
  onNext: () => void;
}): React.ReactElement {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const { data: customers } = useCustomers({ search: deferredSearch || undefined });
  const { data: locations } = useLocations();

  const canProceed = selectedLocationId && (isWalkIn ? walkInName.trim().length > 0 : Boolean(selectedCustomerId));

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 14 }}>
      {/* Walk-in toggle */}
      <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>Walk-in Customer</Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>No account required</Text>
        </View>
        <Switch
          value={isWalkIn}
          onValueChange={setIsWalkIn}
          trackColor={{ true: '#3b74f5', false: '#dde5f0' }}
          thumbColor="#ffffff"
        />
      </View>

      {/* Customer */}
      <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
        <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>
          {isWalkIn ? 'CUSTOMER NAME' : 'SELECT CUSTOMER'}
        </Text>
        {isWalkIn ? (
          <TextInput
            value={walkInName}
            onChangeText={setWalkInName}
            placeholder="Enter customer name…"
            placeholderTextColor="#94a3b8"
            style={{ color: '#0f172a', fontSize: 15, borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingBottom: 6 }}
          />
        ) : (
          <>
            <TextInput
              value={selectedCustomerName || search}
              onChangeText={(t) => { setSearch(t); setSelectedCustomerId(''); setSelectedCustomerName(''); }}
              placeholder="Search customer…"
              placeholderTextColor="#94a3b8"
              style={{ color: '#0f172a', fontSize: 15, borderBottomWidth: 1, borderBottomColor: selectedCustomerId ? '#3b74f5' : '#dde5f0', paddingBottom: 6 }}
            />
            {!selectedCustomerId && search.length > 1 && customers?.data.slice(0, 5).map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => { setSelectedCustomerId(c.id); setSelectedCustomerName(c.name); setSearch(''); }}
                style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}
              >
                <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>{c.name}</Text>
                {c.phone && <Text style={{ color: '#64748b', fontSize: 12 }}>{c.phone}</Text>}
              </TouchableOpacity>
            ))}
          </>
        )}
      </View>

      {/* Location */}
      <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
        <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>STOCK LOCATION</Text>
        <Text style={{ color: '#64748b', fontSize: 11, marginBottom: 10 }}>
          All items in this order will remove stock from the selected location.
        </Text>
        {locations?.map((loc) => (
          <TouchableOpacity
            key={loc.id}
            onPress={() => { setSelectedLocationId(loc.id); setSelectedLocationName(loc.name); }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              paddingVertical: 10,
              borderBottomWidth: 1,
              borderBottomColor: '#f1f5f9',
            }}
          >
            <View style={{
              width: 20, height: 20, borderRadius: 10, borderWidth: 2,
              borderColor: selectedLocationId === loc.id ? '#3b74f5' : '#dde5f0',
              backgroundColor: selectedLocationId === loc.id ? '#3b74f5' : '#ffffff',
              alignItems: 'center', justifyContent: 'center', marginRight: 10,
            }}>
              {selectedLocationId === loc.id && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#ffffff' }} />}
            </View>
            <View>
              <Text style={{ color: '#0f172a', fontWeight: selectedLocationId === loc.id ? '700' : '400', fontSize: 14 }}>
                {loc.name} {loc.isDefault ? '(Default)' : ''}
              </Text>
              {loc.warehouseName && <Text style={{ color: '#64748b', fontSize: 12 }}>{loc.warehouseName}</Text>}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        onPress={onNext}
        disabled={!canProceed}
        style={{
          backgroundColor: canProceed ? '#3b74f5' : '#dde5f0',
          borderRadius: 14,
          padding: 16,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: canProceed ? '#ffffff' : '#94a3b8', fontWeight: '700', fontSize: 15 }}>
          Next — Add Products →
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// ── step 2: add products ──────────────────────────────────────────────────────

interface ProductSearchResult {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  availableQty: number;
}

function Step2({
  items,
  setItems,
  locationId,
  onNext,
  onBack,
}: {
  items: LineItem[];
  setItems: React.Dispatch<React.SetStateAction<LineItem[]>>;
  locationId: string;
  onNext: () => void;
  onBack: () => void;
}): React.ReactElement {
  const [search, setSearch] = useState('');

  const updateQty = useCallback((idx: number, delta: number) => {
    setItems((prev) => prev.map((item, i) => {
      if (i !== idx) return item;
      const newQty = Math.max(1, item.quantity + delta);
      return { ...item, quantity: newQty };
    }));
  }, [setItems]);

  const removeItem = useCallback((idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }, [setItems]);

  const total = grandTotal(items);

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* Search / scan bar */}
      <View style={{ backgroundColor: '#ffffff', borderRadius: 12, borderWidth: 1, borderColor: '#dde5f0', flexDirection: 'row', alignItems: 'center', overflow: 'hidden' }}>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search product or SKU…"
          placeholderTextColor="#94a3b8"
          style={{ flex: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, color: '#0f172a' }}
        />
        <TouchableOpacity style={{ backgroundColor: '#f59e0b', paddingHorizontal: 14, paddingVertical: 12 }}>
          <Text style={{ fontSize: 20 }}>📷</Text>
        </TouchableOpacity>
      </View>

      {/* Product lines */}
      {items.length === 0 ? (
        <View style={{ paddingVertical: 32, alignItems: 'center' }}>
          <Text style={{ fontSize: 36 }}>🛒</Text>
          <Text style={{ color: '#64748b', fontSize: 14, marginTop: 10, textAlign: 'center' }}>
            Search or scan a product to add it to this order.
          </Text>
        </View>
      ) : (
        items.map((item, idx) => (
          <View key={`${item.productId}-${idx}`} style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <Text style={{ flex: 1, color: '#0f172a', fontWeight: '600', fontSize: 14, marginRight: 10 }}>{item.productName}</Text>
              <TouchableOpacity onPress={() => removeItem(idx)}>
                <Text style={{ color: '#ef4444', fontSize: 18 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              {/* Stepper */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TouchableOpacity onPress={() => updateQty(idx, -1)} style={{ width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#dde5f0', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, color: '#3b74f5' }}>−</Text>
                </TouchableOpacity>
                <View style={{ width: 40, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#3b74f5', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }}>{item.quantity}</Text>
                </View>
                <TouchableOpacity onPress={() => updateQty(idx, 1)} style={{ width: 32, height: 32, borderRadius: 8, borderWidth: 1, borderColor: '#dde5f0', alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontSize: 18, color: '#3b74f5' }}>+</Text>
                </TouchableOpacity>
              </View>
              {/* Price */}
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={{ color: '#22c55e', fontWeight: '800', fontSize: 15 }}>{fmt(lineTotal(item))}</Text>
                <Text style={{ color: '#64748b', fontSize: 11 }}>
                  {fmt(item.unitPrice)} × {item.quantity}
                  {item.discountPercent > 0 ? ` · ${item.discountPercent}% disc` : ''}
                </Text>
              </View>
            </View>
          </View>
        ))
      )}

      {/* Running total */}
      {items.length > 0 && (
        <View style={{ backgroundColor: '#0d1b3e', borderRadius: 12, padding: 14 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: '#93a5c4', fontSize: 13 }}>{items.reduce((s, i) => s + i.quantity, 0)} items</Text>
            <Text style={{ color: '#ffffff', fontWeight: '900', fontSize: 18 }}>{fmt(total)}</Text>
          </View>
        </View>
      )}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={onBack}
          style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#dde5f0' }}
        >
          <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onNext}
          disabled={items.length === 0}
          style={{ flex: 2, backgroundColor: items.length > 0 ? '#3b74f5' : '#dde5f0', borderRadius: 14, padding: 16, alignItems: 'center' }}
        >
          <Text style={{ color: items.length > 0 ? '#ffffff' : '#94a3b8', fontWeight: '700', fontSize: 15 }}>
            Review & Submit →
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── step 3: review ────────────────────────────────────────────────────────────

function Step3({
  customerName,
  locationName,
  items,
  notes,
  setNotes,
  onSubmit,
  onBack,
  submitting,
}: {
  customerName: string;
  locationName: string;
  items: LineItem[];
  notes: string;
  setNotes: (v: string) => void;
  onSubmit: () => void;
  onBack: () => void;
  submitting: boolean;
}): React.ReactElement {
  const total = grandTotal(items);
  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const taxTotal = total - subtotal;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
      <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
        <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>CUSTOMER & LOCATION</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: '#64748b', fontSize: 13 }}>Customer</Text>
          <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{customerName}</Text>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#64748b', fontSize: 13 }}>Location</Text>
          <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 13 }}>{locationName}</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
        <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 10 }}>ORDER SUMMARY</Text>
        {items.map((item, idx) => (
          <View key={idx} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ color: '#64748b', fontSize: 13, flex: 1 }} numberOfLines={1}>
              {item.productName} × {item.quantity}
            </Text>
            <Text style={{ color: '#0f172a', fontSize: 13, fontWeight: '600' }}>{fmt(lineTotal(item))}</Text>
          </View>
        ))}
        <View style={{ height: 1, backgroundColor: '#dde5f0', marginVertical: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: '#64748b', fontSize: 13 }}>Subtotal</Text>
          <Text style={{ color: '#0f172a', fontSize: 13 }}>{fmt(subtotal)}</Text>
        </View>
        {taxTotal > 0 && (
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: '#64748b', fontSize: 13 }}>Tax</Text>
            <Text style={{ color: '#0f172a', fontSize: 13 }}>{fmt(taxTotal)}</Text>
          </View>
        )}
        <View style={{ height: 1, backgroundColor: '#dde5f0', marginVertical: 8 }} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 16 }}>Total</Text>
          <Text style={{ color: '#22c55e', fontWeight: '900', fontSize: 18 }}>{fmt(total)}</Text>
        </View>
      </View>

      <View style={{ backgroundColor: '#ffffff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#dde5f0' }}>
        <Text style={{ color: '#64748b', fontSize: 11, fontWeight: '700', marginBottom: 8 }}>NOTES (OPTIONAL)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g. deliver by evening…"
          placeholderTextColor="#94a3b8"
          multiline
          style={{ color: '#0f172a', fontSize: 14, minHeight: 48 }}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <TouchableOpacity
          onPress={onBack}
          disabled={submitting}
          style={{ flex: 1, backgroundColor: '#ffffff', borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#dde5f0' }}
        >
          <Text style={{ color: '#64748b', fontWeight: '700', fontSize: 15 }}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onSubmit}
          disabled={submitting}
          style={{ flex: 2, backgroundColor: submitting ? '#93c5fd' : '#22c55e', borderRadius: 14, padding: 16, alignItems: 'center' }}
        >
          {submitting
            ? <ActivityIndicator color="#ffffff" />
            : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 15 }}>✓ Place Order</Text>
          }
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// ── main screen ───────────────────────────────────────────────────────────────

export interface NewOrderScreenProps {
  onBack: () => void;
  onSuccess: (orderId: string) => void;
}

export function NewOrderScreen({ onBack, onSuccess }: NewOrderScreenProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const createOrder = useCreateSaleOrder();

  const [step, setStep] = useState<Step>(1);
  const [isWalkIn, setIsWalkIn] = useState(false);
  const [walkInName, setWalkInName] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  const [selectedLocationName, setSelectedLocationName] = useState('');
  const [items, setItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState('');

  const customerName = isWalkIn ? walkInName : selectedCustomerName;

  const handleSubmit = useCallback(async () => {
    const payload: CreateSaleOrderPayload = {
      locationId: selectedLocationId,
      notes: notes || undefined,
      items: items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
        discountPercent: i.discountPercent || undefined,
        taxPercent: i.taxPercent || undefined,
      })),
    };
    if (isWalkIn) {
      payload.customerName = walkInName;
      payload.isWalkIn = true;
    } else {
      payload.customerId = selectedCustomerId;
    }
    try {
      const created = await createOrder.mutateAsync(payload);
      onSuccess(created.id);
    } catch {
      Alert.alert('Error', 'Could not place order. Please try again.');
    }
  }, [
    selectedLocationId, notes, items, isWalkIn,
    walkInName, selectedCustomerId, createOrder, onSuccess,
  ]);

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#dde5f0', paddingTop: insets.top + 10, paddingHorizontal: 16, paddingBottom: 4 }}>
        <TouchableOpacity onPress={onBack} style={{ marginBottom: 6 }}>
          <Text style={{ color: '#3b74f5', fontSize: 14 }}>✕ Cancel</Text>
        </TouchableOpacity>
        <Text style={{ color: '#0f172a', fontWeight: '800', fontSize: 20, marginBottom: 2 }}>New Order</Text>
      </View>
      <StepIndicator step={step} />

      {step === 1 && (
        <Step1
          isWalkIn={isWalkIn} setIsWalkIn={setIsWalkIn}
          walkInName={walkInName} setWalkInName={setWalkInName}
          selectedCustomerId={selectedCustomerId} setSelectedCustomerId={setSelectedCustomerId}
          selectedCustomerName={selectedCustomerName} setSelectedCustomerName={setSelectedCustomerName}
          selectedLocationId={selectedLocationId} setSelectedLocationId={setSelectedLocationId}
          selectedLocationName={selectedLocationName} setSelectedLocationName={setSelectedLocationName}
          onNext={() => setStep(2)}
        />
      )}
      {step === 2 && (
        <Step2
          items={items}
          setItems={setItems}
          locationId={selectedLocationId}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}
      {step === 3 && (
        <Step3
          customerName={customerName}
          locationName={selectedLocationName}
          items={items}
          notes={notes}
          setNotes={setNotes}
          onSubmit={() => void handleSubmit()}
          onBack={() => setStep(2)}
          submitting={createOrder.isPending}
        />
      )}
    </View>
  );
}
