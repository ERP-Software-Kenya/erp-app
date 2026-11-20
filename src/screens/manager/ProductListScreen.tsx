import React, { useDeferredValue, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useProductsInfinite } from '@/hooks/manager/useProducts';
import type { Product } from '@/api/manager/products.api';

export interface ProductListScreenNavProps {
  onBack: () => void;
  onOpenProduct: (id: string) => void;
  onNewProduct: () => void;
}

function ProductCard({ product, onPress }: { product: Product; onPress: () => void }): React.ReactElement {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{ backgroundColor: '#ffffff', borderRadius: 12, marginHorizontal: 16, marginBottom: 10, padding: 14, borderWidth: 1, borderColor: '#dde5f0', borderLeftWidth: 4, borderLeftColor: product.isActive ? '#3b74f5' : '#cbd5e1' }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', fontSize: 15, color: '#0f172a' }} numberOfLines={1}>{product.name}</Text>
          <Text style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>SKU: {product.sku || '—'}</Text>
        </View>
        {!product.isActive && (
          <View style={{ backgroundColor: '#f1f5f9', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginLeft: 8 }}>
            <Text style={{ color: '#64748b', fontSize: 10, fontWeight: '700' }}>INACTIVE</Text>
          </View>
        )}
      </View>
      <View style={{ flexDirection: 'row', marginTop: 10, gap: 16 }}>
        <View>
          <Text style={{ color: '#64748b', fontSize: 11 }}>Selling Price</Text>
          <Text style={{ color: '#0f172a', fontWeight: '700', fontSize: 14 }}>
            ₹{product.sellingPrice.toLocaleString('en-IN')}
          </Text>
        </View>
        {product.costPrice !== undefined && (
          <View>
            <Text style={{ color: '#64748b', fontSize: 11 }}>Cost Price</Text>
            <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>
              ₹{product.costPrice.toLocaleString('en-IN')}
            </Text>
          </View>
        )}
        <View>
          <Text style={{ color: '#64748b', fontSize: 11 }}>Unit</Text>
          <Text style={{ color: '#0f172a', fontWeight: '600', fontSize: 14 }}>{product.unit}</Text>
        </View>
        {product.currentStock !== undefined && (
          <View>
            <Text style={{ color: '#64748b', fontSize: 11 }}>Stock</Text>
            <Text style={{ color: product.currentStock < 10 ? '#ef4444' : '#0f172a', fontWeight: '600', fontSize: 14 }}>
              {product.currentStock}
            </Text>
          </View>
        )}
      </View>
      {product.category && (
        <View style={{ marginTop: 8, flexDirection: 'row' }}>
          <View style={{ backgroundColor: '#eff6ff', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 }}>
            <Text style={{ color: '#3b74f5', fontSize: 11, fontWeight: '600' }}>{product.category}</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

export function ProductListScreen({ onBack, onOpenProduct, onNewProduct }: ProductListScreenNavProps): React.ReactElement {
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useProductsInfinite(deferredSearch);
  const products = data?.pages.flatMap((p) => p.data) ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4f8' }}>
      {/* Header */}
      <View style={{ backgroundColor: '#ffffff', paddingTop: insets.top + 8, paddingBottom: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#dde5f0', flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <TouchableOpacity onPress={onBack} style={{ paddingVertical: 4, paddingRight: 8 }}>
          <Text style={{ fontSize: 22, color: '#3b74f5' }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ flex: 1, fontWeight: '800', fontSize: 20, color: '#0f172a' }}>Products</Text>
        <TouchableOpacity onPress={onNewProduct} style={{ backgroundColor: '#3b74f5', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 7 }}>
          <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 13 }}>+ New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: 10, borderWidth: 1, borderColor: '#dde5f0', paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          <Text style={{ color: '#94a3b8' }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name or SKU…"
            placeholderTextColor="#94a3b8"
            style={{ flex: 1, color: '#0f172a', fontSize: 15 }}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: '#94a3b8', fontSize: 16 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color="#3b74f5" size="large" />
        </View>
      ) : (
        <FlashList
          data={products}
          keyExtractor={(p) => p.id}
          contentContainerStyle={{ paddingTop: 12, paddingBottom: insets.bottom + 24 }}
          renderItem={({ item }) => (
            <ProductCard product={item} onPress={() => onOpenProduct(item.id)} />
          )}
          onEndReached={() => { if (hasNextPage && !isFetchingNextPage) void fetchNextPage(); }}
          onEndReachedThreshold={0.4}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={{ marginVertical: 16 }} color="#3b74f5" /> : null}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', paddingTop: 60 }}>
              <Text style={{ fontSize: 36 }}>📦</Text>
              <Text style={{ color: '#64748b', fontSize: 15, marginTop: 12 }}>No products found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
