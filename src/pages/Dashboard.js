import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import {
  Card, Row, Col, Statistic, Skeleton, Table, Tag, message,
  Button, Badge, Alert, Typography
} from "antd";
import {
  DollarCircleOutlined, ShoppingCartOutlined,
  CalendarOutlined, WarningOutlined, RiseOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import API from "../api";
import { io } from "socket.io-client";

const { Text } = Typography;

// ─── Pure CSS Bar Chart (no external chart lib) ─────────────────────────────
const SalesBarChart = ({ data = [], period }) => {
  if (!data.length) return null;
  const maxRev = Math.max(...data.map((d) => d.revenue), 1);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 160, padding: "0 8px" }}>
        {data.map((d, i) => {
          const pct = Math.round((d.revenue / maxRev) * 100);
          return (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 700 }}>
                ₹{d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue}
              </span>
              <div
                title={`${d.label}: ₹${d.revenue} (${d.orders} orders)`}
                style={{
                  width: "100%",
                  height: `${Math.max(pct, 4)}%`,
                  background: "linear-gradient(180deg, #818cf8, #6366f1)",
                  borderRadius: "6px 6px 0 0",
                  transition: "height 0.5s ease",
                  cursor: "pointer",
                  minHeight: 6,
                }}
              />
              <span style={{ fontSize: 10, color: "var(--text-secondary)", textAlign: "center", lineHeight: 1.2, maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {d.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Dashboard ────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentBills, setRecentBills] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartPeriod, setChartPeriod] = useState("daily");
  const [lowStockItems, setLowStockItems] = useState([]);

  const getStats = async () => {
    try {
      setLoading(true);
      const [statsRes, billsRes] = await Promise.all([
        API.get("/api/bills/total-revenue"),
        API.get("/api/bills/get-bills"),
      ]);
      if (statsRes.data?.success) setStats(statsRes.data);
      const all = Array.isArray(billsRes.data) ? billsRes.data : [];
      setRecentBills([...all].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8));
    } catch (e) {
      console.error("Dashboard error:", e);
    } finally {
      setLoading(false);
    }
  };

  const fetchChart = async (period) => {
    try {
      const { data } = await API.get(`/api/dashboard/revenue?period=${period}`);
      if (data.success) setChartData(data.data);
    } catch (e) { console.error(e); }
  };

  const fetchLowStock = async () => {
    try {
      const { data } = await API.get("/api/dashboard/low-stock");
      if (data.success) setLowStockItems(data.items);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    getStats();
    fetchChart("daily");
    fetchLowStock();

    const socketHost = window.location.hostname === "localhost"
      ? "http://localhost:8080"
      : `${window.location.protocol}//${window.location.host}`;
    const socket = io(socketHost);
    socket.on("connect", () => console.log("Dashboard socket connected"));
    socket.on("new-order", (bill) => {
      message.success(`🛒 New order from ${bill.customerName}!`);
      getStats();
    });
    socket.on("connect_error", () => {
      const iv = setInterval(getStats, 30000);
      return () => clearInterval(iv);
    });
    return () => socket.disconnect();
  }, []);

  const handleChartToggle = (period) => {
    setChartPeriod(period);
    fetchChart(period);
  };

  const columns = [
    {
      title: "Customer", dataIndex: "customerName", key: "cn",
      render: (t) => <b style={{ color: "var(--text-primary)" }}>{t}</b>
    },
    {
      title: "Items", dataIndex: "cartItems", key: "ci",
      render: (items) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {items.slice(0, 3).map((it, i) => (
            <Tag color="geekblue" key={i} style={{ borderRadius: 6 }}>
              {it.name} ×{it.quantity}
            </Tag>
          ))}
          {items.length > 3 && <Tag>+{items.length - 3}</Tag>}
        </div>
      ),
    },
    {
      title: "Amount", dataIndex: "totalAmount", key: "ta",
      render: (a) => <span style={{ color: "#059669", fontWeight: 800 }}>₹{a?.toFixed(2)}</span>
    },
    {
      title: "Status", dataIndex: "status", key: "st",
      render: (s) => (
        <Tag color={s === "Completed" ? "success" : s === "Cancelled" ? "error" : s === "Processing" ? "processing" : "warning"}>
          {s || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Time", dataIndex: "date", key: "dt",
      render: (d) => (
        <span style={{ color: "var(--text-secondary)", fontSize: 13 }}>
          {new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div style={{ padding: "0 8px" }}>
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
              Business Intelligence
            </h1>
            <p style={{ color: "var(--text-secondary)", margin: "4px 0 0", fontSize: 15 }}>
              Real-time sales monitoring and insights
            </p>
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {lowStockItems.length > 0 && (
              <Badge count={lowStockItems.length} offset={[-4, 4]}>
                <Button
                  danger
                  icon={<WarningOutlined />}
                  onClick={() => document.getElementById("low-stock-section")?.scrollIntoView({ behavior: "smooth" })}
                >
                  Low Stock
                </Button>
              </Badge>
            )}
            <Button icon={<RiseOutlined />} onClick={getStats} className="glass-morph">
              Refresh
            </Button>
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", background: "rgba(16, 185, 129, 0.1)", borderRadius: 12, color: "var(--success)", fontWeight: 700 }}>
              <span style={{ width: 8, height: 8, background: "var(--success)", borderRadius: "50%", boxShadow: "0 0 0 3px rgba(16,185,129,0.2)", display: "inline-block" }} />
              Live
            </div>
          </div>
        </div>

        {/* ── KPI Cards ── */}
        <Row gutter={[20, 20]}>
          {[
            { label: "TODAY'S REVENUE", value: stats?.todayRevenue, icon: <DollarCircleOutlined />, color: "rgba(99, 102, 241, 0.1)", textColor: "#6366f1" },
            { label: "MONTHLY REVENUE", value: stats?.monthlyRevenue, icon: <CalendarOutlined />, color: "rgba(249, 115, 22, 0.1)", textColor: "#f97316" },
            { label: "TOTAL REVENUE", value: stats?.totalRevenue, icon: <DollarCircleOutlined />, color: "rgba(34, 197, 94, 0.1)", textColor: "#22c55e" },
            { label: "TOTAL ORDERS", value: stats?.totalOrders, icon: <ShoppingCartOutlined />, color: "rgba(59, 130, 246, 0.1)", textColor: "#3b82f6", isCount: true },
          ].map((kpi, i) => (
            <Col xs={24} sm={12} lg={6} key={i}>
              <Card className="glass-morph stat-card">
                <div className="stat-icon" style={{ background: kpi.color, color: kpi.textColor }}>{kpi.icon}</div>
                <Statistic
                  title={<span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.04em" }}>{kpi.label}</span>}
                  value={kpi.isCount ? (stats?.[kpi.label === "TOTAL ORDERS" ? "totalOrders" : ""] || 0) : (stats?.[["todayRevenue", "monthlyRevenue", "totalRevenue"][i]] || 0)}
                  precision={kpi.isCount ? 0 : 2}
                  prefix={kpi.isCount ? "" : "₹"}
                  valueStyle={{ color: "var(--text-primary)", fontWeight: 800, fontSize: 26 }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* ── Sales Chart + Low Stock ── */}
        <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
          <Col xs={24} lg={16}>
            <Card
              className="glass-morph"
              title={<span style={{ fontWeight: 800, fontSize: 16 }}>📊 Revenue Chart</span>}
              extra={
                <div style={{ display: "flex", gap: 8 }}>
                  {["daily", "monthly"].map((p) => (
                    <Button
                      key={p}
                      type={chartPeriod === p ? "primary" : "default"}
                      size="small"
                      onClick={() => handleChartToggle(p)}
                      style={{ borderRadius: 8 }}
                    >
                      {p === "daily" ? "7 Days" : "6 Months"}
                    </Button>
                  ))}
                </div>
              }
            >
              <SalesBarChart data={chartData} period={chartPeriod} />
              <div style={{ textAlign: "center", marginTop: 12, color: "var(--text-muted)", fontSize: 12 }}>
                {chartPeriod === "daily" ? "Last 7 days revenue" : "Last 6 months revenue"}
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={8} id="low-stock-section">
            <Card
              className="glass-morph"
              title={
                <span style={{ fontWeight: 800, fontSize: 16 }}>
                  <WarningOutlined style={{ color: "#f59e0b", marginRight: 8 }} />
                  Low Stock
                  {lowStockItems.length > 0 && (
                    <Badge count={lowStockItems.length} style={{ marginLeft: 10, backgroundColor: "#ef4444" }} />
                  )}
                </span>
              }
              bodyStyle={{ padding: 0 }}
            >
              {lowStockItems.length === 0 ? (
                <div style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>✅</div>
                  <div>All items are well-stocked!</div>
                </div>
              ) : (
                <div>
                  {lowStockItems.map((item) => (
                    <div
                      key={item._id}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "12px 20px", borderBottom: "1px solid var(--border-color)"
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: 14 }}>{item.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.category}</div>
                      </div>
                      <Tag color={item.quantity === 0 ? "error" : item.quantity < 5 ? "warning" : "orange"} style={{ fontWeight: 700, fontSize: 13 }}>
                        {item.quantity === 0 ? "OUT OF STOCK" : `${item.quantity} left`}
                      </Tag>
                    </div>
                  ))}
                  <div style={{ padding: "12px 20px" }}>
                    <Button type="link" onClick={() => navigate("/items")} style={{ padding: 0 }}>
                      Manage Inventory →
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* ── Recent Orders Table ── */}
        <Row style={{ marginTop: 24 }}>
          <Col span={24}>
            <Card
              className="glass-morph"
              title={<span style={{ fontWeight: 800, fontSize: 16 }}>⚡ Real-Time Activity</span>}
              extra={<Button size="small" onClick={() => navigate("/orders")}>View All</Button>}
              bodyStyle={{ padding: 0 }}
            >
              {loading && !recentBills.length ? (
                <div style={{ padding: 24 }}><Skeleton active /></div>
              ) : (
                <Table
                  dataSource={recentBills}
                  columns={columns}
                  rowKey="_id"
                  pagination={false}
                  scroll={{ x: 600 }}
                />
              )}
            </Card>
          </Col>
        </Row>
      </div>

      <style>{`
        .pulse-dot { width:8px;height:8px;background:#059669;border-radius:50%;box-shadow:0 0 0 0 rgba(5,150,105,.7);animation:pulse 2s infinite; }
        @keyframes pulse { 0%{transform:scale(.95);box-shadow:0 0 0 0 rgba(5,150,105,.7)} 70%{transform:scale(1);box-shadow:0 0 0 10px rgba(5,150,105,0)} 100%{transform:scale(.95);box-shadow:0 0 0 0 rgba(5,150,105,0)} }
      `}</style>
    </DefaultLayout>
  );
};

export default Dashboard;
