import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProduct, useUpdateProduct } from '@/hooks/manager/useProducts';

const UNITS = ['pcs', 'kg', 'g', 'ltr', 'ml', 'box', 'dozen', 'mtr', 'set', 'pair'];

export interface ProductDetailScreenNavProps {
  id: string;
  onBack: () => void;
}

function InfoRow({ label, value }: { label: string; value?: string | number }): React.ReactElement {
  if (value === undefined || value === null || value === '') return <></>;
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }}>
      <Text style={{ color: '#64748b', fontSize: 14 }}>{label}</Text>
      <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14, flex: 1, textAlign: 'right' }}>{value}</Text>
    </View>
  );
}

function EditField({
  label, value, onChangeText, placeholder, keyboardType, multiline,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  multiline?: boolean;
}): React.ReactElement {
  return (
    <View style={{ marginBottom: 14 }}>
      <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#94a3b8"
        keyboardType={keyboardType ?? 'default'}
        multiline={multiline}
        numberOfLines={multiline ? 3 : 1}
        style={{ backgroundColor: '#f8fafc', borderRadius: 10, borderWidth: 1, borderColor: '#dde5f0', color: '#0f172a', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, textAlignVertical: multiline ? 'top' : 'center', minHeight: multiline ? 80 : undefined }}
      />
    </View>
  );
}

export function ProductDetailScreen({ id, onBack }: ProductDetailScreenNavProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { data: product, isLoading } = useProduct(id);
  const { mutateAsync: updateProduct, isPending: isSaving } = useUpdateProduct(id);

  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [taxPercent, setTaxPercent] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!product) return;
    setName(product.name);
    setSku(product.sku ?? '');
    setDescription(product.description ?? '');
    setCategory(product.category ?? '');
    setUnit(product.unit);
    setSellingPrice(String(product.sellingPrice));
    setCostPrice(product.costPrice !== undefined ? String(product.costPrice) : '');
    setTaxPercent(product.taxPercent !== undefined ? String(product.taxPercent) : '');
    setWeightKg(product.weightKg !== undefined ? String(product.weightKg) : '');
    setIsActive(product.isActive);
  }, [product]);

  const handleSave = async () => {
    if (!name.trim() || !sellingPrice) return;
    try {
      await updateProduct({
        name: name.trim(),
        sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        unit,
        sellingPrice: parseFloat(sellingPrice),
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        taxPercent: taxPercent ? parseFloat(taxPercent) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
        isActive,
      });
      setEditing(false);
    } catch {
      Alert.alert('Error', 'Failed to update product. Please try again.');
    }
  };

  const handleDiscard = () => {
    if (!product) return;
    setName(product.name);
    setSku(product.sku ?? '');
    setDescription(product.description ?? '');
    setCategory(product.category ?? '');
    setUnit(product.unit);
    setSellingPrice(String(product.sellingPrice));
    setCostPrice(product.costPrice !== undefined ? String(product.costPrice) : '');
    setTaxPercent(product.taxPercent !== undefined ? String(product.taxPercent) : '');
    setWeightKg(product.weightKg !== undefined ? String(product.weightKg) : '');
    setIsActive(product.isActive);
    setEditing(false);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', paddingTop: insets.top + 8, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#dde5f0', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={editing ? handleDiscard : onBack} style={{ paddingVertical: 4, paddingRight: 8 }}>
          <Text style={{ fontSize: 22, color: '#3b74f5' }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontWeight: '800', fontSize: 20, color: '#0f172a' }} numberOfLines={1}>
          {product?.name ?? 'Product'}
        </Text>
        {!isLoading && product && (
          editing ? (
            <TouchableOpacity
              onPress={() => void handleSave()}
              disabled={isSaving}
              style={{ backgroundColor: '#3b74f5', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 }}
            >
              {isSaving ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Save</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => setEditing(true)} style={{ backgroundColor: '#f0f4f8', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8, borderWidth: 1, borderColor: '#dde5f0' }}>
              <Text style={{ color: '#3b74f5', fontWeight: '700', fontSize: 14 }}>Edit</Text>
            </TouchableOpacity>
          )
        )}
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#3b74f5" size="large" />
        </View>
      ) : !product ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#64748b' }}>Product not found.</Text>
        </View>
      ) : editing ? (
        /* ── Edit mode ── */
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
          <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Basic Information</Text>
            <EditField label="Product Name *" value={name} onChangeText={setName} placeholder="Product name" />
            <EditField label="SKU" value={sku} onChangeText={setSku} placeholder="Leave blank to keep existing" />
            <EditField label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Grains" />
            <EditField label="Description" value={description} onChangeText={setDescription} placeholder="Optional" multiline />
          </View>

          <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Pricing & Tax</Text>
            <EditField label="Selling Price (₹) *" value={sellingPrice} onChangeText={setSellingPrice} placeholder="0.00" keyboardType="decimal-pad" />
            <EditField label="Cost Price (₹)" value={costPrice} onChangeText={setCostPrice} placeholder="0.00" keyboardType="decimal-pad" />
            <EditField label="Tax (%)" value={taxPercent} onChangeText={setTaxPercent} placeholder="e.g. 18" keyboardType="decimal-pad" />
          </View>

          <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Unit of Measure</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {UNITS.map((u) => (
                <TouchableOpacity
                  key={u}
                  onPress={() => setUnit(u)}
                  style={{ borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8, backgroundColor: unit === u ? '#3b74f5' : '#f0f4f8', borderWidth: 1, borderColor: unit === u ? '#3b74f5' : '#dde5f0' }}
                >
                  <Text style={{ color: unit === u ? '#ffffff' : '#475569', fontWeight: '600', fontSize: 13 }}>{u}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Logistics</Text>
            <EditField label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} placeholder="e.g. 0.5" keyboardType="decimal-pad" />
          </View>

          {/* Active toggle */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <Text style={{ fontWeight: '600', fontSize: 15, color: '#0f172a' }}>Active</Text>
            <TouchableOpacity
              onPress={() => setIsActive((v) => !v)}
              style={{ width: 52, height: 30, borderRadius: 15, backgroundColor: isActive ? '#3b74f5' : '#cbd5e1', paddingHorizontal: 2, justifyContent: 'center' }}
            >
              <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: '#ffffff', alignSelf: isActive ? 'flex-end' : 'flex-start' }} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        /* ── View mode ── */
        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }}>
          {/* Status banner */}
          {!product.isActive && (
            <View style={{ backgroundColor: '#fef3c7', borderRadius: 10, padding: 12, marginBottom: 12, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text>⚠️</Text>
              <Text style={{ color: '#92400e', fontSize: 13, fontWeight: '600' }}>This product is inactive and will not appear in new orders.</Text>
            </View>
          )}

          {/* Pricing card */}
          <View style={{ backgroundColor: '#0d1b3e', borderRadius: 16, padding: 16, marginBottom: 12, flexDirection: 'row', gap: 24 }}>
            <View>
              <Text style={{ color: '#93a5c4', fontSize: 12 }}>Selling Price</Text>
              <Text style={{ color: '#ffffff', fontWeight: '800', fontSize: 22 }}>
                ₹{product.sellingPrice.toLocaleString('en-IN')}
              </Text>
              <Text style={{ color: '#93a5c4', fontSize: 11, marginTop: 2 }}>per {product.unit}</Text>
            </View>
            {product.costPrice !== undefined && (
              <View>
                <Text style={{ color: '#93a5c4', fontSize: 12 }}>Cost Price</Text>
                <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 18 }}>
                  ₹{product.costPrice.toLocaleString('en-IN')}
                </Text>
                <Text style={{ color: '#22c55e', fontSize: 11, marginTop: 2 }}>
                  Margin: ₹{(product.sellingPrice - product.costPrice).toLocaleString('en-IN')}
                </Text>
              </View>
            )}
          </View>

          {/* Details */}
          <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0' }}>
            <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a', marginBottom: 10 }}>Details</Text>
            <InfoRow label="SKU" value={product.sku} />
            <InfoRow label="Category" value={product.category} />
            <InfoRow label="Unit" value={product.unit} />
            <InfoRow label="Tax" value={product.taxPercent !== undefined ? `${product.taxPercent}%` : undefined} />
            <InfoRow label="Weight" value={product.weightKg !== undefined ? `${product.weightKg} kg` : undefined} />
            {product.currentStock !== undefined && <InfoRow label="Current Stock" value={product.currentStock} />}
            {product.description && (
              <View style={{ paddingTop: 10 }}>
                <Text style={{ color: '#64748b', fontSize: 12, marginBottom: 4 }}>Description</Text>
                <Text style={{ color: '#0f172a', fontSize: 14, lineHeight: 20 }}>{product.description}</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </KeyboardAvoidingView>
  );
}
