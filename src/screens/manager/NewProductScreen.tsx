import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCreateProduct } from '@/hooks/manager/useProducts';

const UNITS = ['pcs', 'kg', 'g', 'ltr', 'ml', 'box', 'dozen', 'mtr', 'set', 'pair'];

export interface NewProductScreenNavProps {
  onBack: () => void;
  onSuccess: (productId: string) => void;
}

function Label({ text }: { text: string }): React.ReactElement {
  return <Text style={{ color: '#64748b', fontSize: 12, fontWeight: '600', marginBottom: 6 }}>{text}</Text>;
}

function Field({
  label, value, onChangeText, placeholder, keyboardType, multiline, required,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric' | 'decimal-pad';
  multiline?: boolean;
  required?: boolean;
}): React.ReactElement {
  return (
    <View style={{ marginBottom: 14 }}>
      <Label text={required ? `${label} *` : label} />
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

export function NewProductScreen({ onBack, onSuccess }: NewProductScreenNavProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const { mutateAsync: createProduct, isPending } = useCreateProduct();

  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [sellingPrice, setSellingPrice] = useState('');
  const [costPrice, setCostPrice] = useState('');
  const [taxPercent, setTaxPercent] = useState('');
  const [weightKg, setWeightKg] = useState('');

  const canSubmit = name.trim().length > 0 && sellingPrice.trim().length > 0 && parseFloat(sellingPrice) > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      const product = await createProduct({
        name: name.trim(),
        sku: sku.trim() || undefined,
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        unit,
        sellingPrice: parseFloat(sellingPrice),
        costPrice: costPrice ? parseFloat(costPrice) : undefined,
        taxPercent: taxPercent ? parseFloat(taxPercent) : undefined,
        weightKg: weightKg ? parseFloat(weightKg) : undefined,
      });
      onSuccess(product.id);
    } catch {
      Alert.alert('Error', 'Failed to create product. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', paddingTop: insets.top + 8, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#dde5f0', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ paddingVertical: 4, paddingRight: 8 }}>
          <Text style={{ fontSize: 22, color: '#3b74f5' }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontWeight: '800', fontSize: 20, color: '#0f172a' }}>New Product</Text>
        <TouchableOpacity
          onPress={() => void handleSubmit()}
          disabled={!canSubmit || isPending}
          style={{ backgroundColor: canSubmit && !isPending ? '#3b74f5' : '#cbd5e1', borderRadius: 10, paddingHorizontal: 16, paddingVertical: 8 }}
        >
          {isPending ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>Save</Text>}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32 }} keyboardShouldPersistTaps="handled">
        {/* Basic info */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Basic Information</Text>
          <Field label="Product Name" value={name} onChangeText={setName} placeholder="e.g. Rice 5kg Bag" required />
          <Field label="SKU" value={sku} onChangeText={setSku} placeholder="Leave blank to auto-generate" />
          <Field label="Category" value={category} onChangeText={setCategory} placeholder="e.g. Grains, Electronics…" />
          <Field label="Description" value={description} onChangeText={setDescription} placeholder="Optional product description" multiline />
        </View>

        {/* Pricing */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Pricing & Tax</Text>
          <Field label="Selling Price (₹)" value={sellingPrice} onChangeText={setSellingPrice} placeholder="0.00" keyboardType="decimal-pad" required />
          <Field label="Cost Price (₹)" value={costPrice} onChangeText={setCostPrice} placeholder="0.00" keyboardType="decimal-pad" />
          <Field label="Tax (%)" value={taxPercent} onChangeText={setTaxPercent} placeholder="e.g. 18" keyboardType="decimal-pad" />
        </View>

        {/* Unit */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Unit of Measure *</Text>
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

        {/* Logistics */}
        <View style={{ backgroundColor: '#ffffff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#dde5f0' }}>
          <Text style={{ fontWeight: '700', fontSize: 14, color: '#0f172a', marginBottom: 14 }}>Logistics</Text>
          <Field label="Weight (kg)" value={weightKg} onChangeText={setWeightKg} placeholder="e.g. 0.5" keyboardType="decimal-pad" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
