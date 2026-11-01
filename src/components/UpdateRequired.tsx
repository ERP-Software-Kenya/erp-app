import React, { useState } from 'react';
import { ActivityIndicator, Linking, Text, TouchableOpacity, View } from 'react-native';
import { createReleaseDownloadUrl, type ReleaseMetadata } from '../api/releases.api';

type Props = {
  latest: ReleaseMetadata;
};

export function UpdateRequired({ latest }: Props): React.ReactElement {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownload = async (): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const url = await createReleaseDownloadUrl();
      await Linking.openURL(url);
    } catch {
      setError('Could not get download link. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-surface items-center justify-center px-8">
      <View className="bg-white rounded-2xl p-8 w-full border border-border items-center">
        <Text className="text-navy font-bold text-xl mb-2 text-center">Update Required</Text>
        <Text className="text-muted text-sm text-center mb-6">
          A new version of the app is available. You must update before continuing.
        </Text>

        <View className="bg-surface rounded-xl px-4 py-3 w-full mb-6 items-center">
          <Text className="text-muted text-xs mb-1">Available version</Text>
          <Text className="text-navy font-semibold text-sm">
            {latest.version} (build {latest.buildNumber})
          </Text>
        </View>

        {error !== null && (
          <Text className="text-destructive text-sm text-center mb-4">{error}</Text>
        )}

        <TouchableOpacity
          className="bg-primary w-full py-4 rounded-xl items-center"
          onPress={() => void handleDownload()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Download Update</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
