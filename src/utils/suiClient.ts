import { SuiClient, getFullnodeUrl } from '@mysten/sui.js/client';

// Initialize Sui client
export const suiClient = new SuiClient({ 
  url: getFullnodeUrl('testnet') 
});

/**
 * Get current epoch from Sui network
 */
export async function getCurrentEpoch(): Promise<number> {
  try {
    const epoch = await suiClient.getLatestSuiSystemState();
    return parseInt(epoch.epoch);
  } catch (error) {
    console.error('Failed to get current epoch:', error);
    throw error;
  }
}

/**
 * Get network info
 */
export async function getNetworkInfo() {
  try {
    const chainId = await suiClient.getChainIdentifier();
    const epoch = await getCurrentEpoch();
    return { chainId, epoch };
  } catch (error) {
    console.error('Failed to get network info:', error);
    throw error;
  }
}
