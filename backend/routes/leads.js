import express from 'express';
import Lead from '../models/Lead.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

const router = express.Router();

/**
 * GET /api/leads/stats — Fetch Dashboard Stats & Analytics Graphs data (100% Real DB Data)
 */
router.get('/stats', async (req, res) => {
  try {
    const totalLeads = await Lead.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalProducts = await Product.countDocuments();

    // Generate last 7 days labels & data points from real MongoDB records
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const weeklyData = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));
      const dayLabel = days[startOfDay.getDay()];

      const ordersCount = await Order.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });

      const leadsCount = await Lead.countDocuments({
        updatedAt: { $gte: startOfDay, $lte: endOfDay }
      });

      weeklyData.push({
        day: dayLabel,
        dateStr: startOfDay.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
        orders: ordersCount,
        leads: leadsCount
      });
    }

    // Dynamic Bottle Size distribution based on actual products in MongoDB
    const allProducts = await Product.find({}, 'bottleSize name price');
    const totalProdCount = allProducts.length;
    const sizeCounts = {};

    allProducts.forEach(p => {
      const s = p.bottleSize || '750ml';
      sizeCounts[s] = (sizeCounts[s] || 0) + 1;
    });

    const colors = ['#0071e3', '#00a389', '#f56300', '#7d52b3', '#e03e2d'];
    const sizeDistribution = Object.keys(sizeCounts).map((size, idx) => ({
      size,
      count: sizeCounts[size],
      pct: totalProdCount > 0 ? Math.round((sizeCounts[size] / totalProdCount) * 100) : 0,
      color: colors[idx % colors.length]
    }));

    res.json({
      success: true,
      data: {
        totalLeads, // 100% Real Lead Count from DB
        totalOrders, // 100% Real Orders Count from DB
        totalProducts, // 100% Real Products Count from DB
        weeklyData,
        sizeDistribution
      }
    });
  } catch (err) {
    console.error('Error fetching leads stats:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

/**
 * GET /api/leads — Fetch all real leads
 */
router.get('/', async (req, res) => {
  try {
    const leads = await Lead.find().sort({ updatedAt: -1 }).limit(20);
    res.json({ success: true, data: leads });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
