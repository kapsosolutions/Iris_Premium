import axios from 'axios';
import Product from '../models/Product.js';

const CATALOG_ID = () => process.env.META_CATALOG_ID || '';
const GRAPH_API = 'https://graph.facebook.com/v21.0';
const TOKEN = () => process.env.META_ACCESS_TOKEN || '';

export function squareUrl(url) {
  if (!url || !url.includes('/upload/')) return url;
  return url.replace('/upload/', '/upload/c_fill,h_500,w_500/');
}

/**
 * Automatically sync/upsert a single product and its bulk pack variants (50, 100, 250, 500, 1000) to Meta Commerce Catalog
 */
export async function syncProductToMetaCatalog(product) {
  const catalogId = CATALOG_ID();
  const token = TOKEN();
  if (!catalogId || !token) {
    console.log('ℹ️ META_CATALOG_ID or ACCESS_TOKEN not set; skipping automatic Meta Catalog sync.');
    return null;
  }

  try {
    const baseRetailerId = product.retailerId || `iris_prod_${product._id}`;
    const linkUrl = process.env.WEBSITE_URL || `https://wa.me/${process.env.PHONE_NUMBER_ID || '919632498664'}`;

    // Collect up to 10 additional gallery image URLs for WhatsApp Carousel ‹ ›
    const extraImagesArray = Array.isArray(product.galleryImages)
      ? product.galleryImages.filter(u => u && u !== product.mainImage).map(u => squareUrl(u)).slice(0, 10)
      : [];

    const packSizes = Array.isArray(product.packSizes) && product.packSizes.length > 0
      ? product.packSizes
      : [50, 100, 250, 500, 1000];

    const perBottlePrice = Number(product.price) || 95;

    // Generate batch requests for base product + bulk pack size items (50, 100, 250, 500, 1000)
    const itemsToSync = [
      {
        id: baseRetailerId,
        title: `${product.name} (${product.bottleSize || '750ml'}) — 1 Bottle`,
        description: product.description || `Natural Alpine Artesian Spring Water (pH 7.8) in ${product.bottleSize || '750ml'} bottle with custom embossed labeling.`,
        price: `${perBottlePrice.toFixed(2)} INR`,
        packQty: 1
      },
      ...packSizes.map(size => ({
        id: `${baseRetailerId}_pack${size}`,
        title: `${product.name} (${product.bottleSize || '750ml'}) — Box of ${size} Bottles`,
        description: `Bulk Case of ${size} custom labeled bottles (${product.name}). ${product.description || ''}`,
        price: `${(perBottlePrice * size).toFixed(2)} INR`,
        packQty: size
      }))
    ];

    const requests = itemsToSync.map(item => {
      const dataObj = {
        id: item.id,
        title: item.title,
        description: item.description,
        availability: product.active !== false ? 'in stock' : 'out of stock',
        price: item.price,
        link: linkUrl,
        google_product_category: 'Food, Beverages & Tobacco > Beverages > Water',
        brand: 'Iris Premium Bottling Co.',
        condition: 'new',
        image_link: squareUrl(product.mainImage),
        item_group_id: baseRetailerId
      };

      if (extraImagesArray.length > 0) {
        dataObj.additional_image_urls = extraImagesArray;
        dataObj.additional_image_cdn_urls = extraImagesArray;
        dataObj.additional_image_link = extraImagesArray.join(',');
      }
      return { method: 'UPDATE', data: dataObj };
    });

    console.log(`\n🔄 Syncing Product "${product.name}" with ${itemsToSync.length} bulk pack item(s) (50, 100, 250...) to Meta Commerce Catalog ID: ${catalogId}...`);

    let resp;
    try {
      resp = await axios.post(
        `${GRAPH_API}/${catalogId}/items_batch`,
        { item_type: 'PRODUCT_ITEM', requests },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    } catch (updateErr) {
      // Fallback to CREATE if items do not exist yet
      requests.forEach(r => r.method = 'CREATE');
      resp = await axios.post(
        `${GRAPH_API}/${catalogId}/items_batch`,
        { item_type: 'PRODUCT_ITEM', requests },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
    }

    console.log(`✅ Product "${product.name}" synced to Meta Commerce Catalog with ${itemsToSync.length} bulk pack size options!`);
    return resp.data;
  } catch (err) {
    console.warn(`⚠️ Meta Catalog Sync Notice for "${product.name}":`, err?.response?.data || err.message);
    return null;
  }
}

/**
 * Delete a product and its bulk pack variants from Meta Commerce Catalog
 */
export async function deleteProductFromMetaCatalog(productId, retailerId) {
  const catalogId = CATALOG_ID();
  const token = TOKEN();
  if (!catalogId || !token) return null;

  try {
    const baseId = retailerId || `iris_prod_${productId}`;
    const packSizes = [50, 100, 250, 500, 1000];
    const idsToDelete = [baseId, ...packSizes.map(s => `${baseId}_pack${s}`)];

    console.log(`\n🗑️ Deleting Product ID ${baseId} and bulk packs from Meta Commerce Catalog...`);
    const requests = idsToDelete.map(id => ({ method: 'DELETE', retailer_id: id }));

    const resp = await axios.post(
      `${GRAPH_API}/${catalogId}/batch`,
      { requests },
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    console.log(`✅ Removed ${idsToDelete.length} item variant(s) from Meta Commerce Catalog!`, resp.data);
    return resp.data;
  } catch (err) {
    console.warn(`Notice deleting from Meta Catalog:`, err?.response?.data || err.message);
    return null;
  }
}

/**
 * Sync ALL active products and their bulk pack variants (50, 100, 250...) to Meta Catalog
 */
export async function syncAllProductsToMetaCatalog() {
  try {
    const products = await Product.find({ active: true });
    console.log(`Found ${products.length} active products to sync bulk packs to Meta Catalog...`);
    for (const prod of products) {
      await syncProductToMetaCatalog(prod);
    }
    console.log('🎉 Bulk pack auto-sync complete for all active products!');
  } catch (err) {
    console.error('Error syncing all products:', err.message);
  }
}
