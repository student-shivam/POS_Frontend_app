import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import {
  Table, Typography, Tag, Space, Card, message, Button,
  Select, Input, DatePicker, Row, Col
} from "antd";
import {
  CalendarOutlined, SearchOutlined, FilterOutlined,
  ShoppingOutlined, DownloadOutlined, ReloadOutlined
} from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const statusColor = (s) =>
  s === "Completed" ? "success" : s === "Cancelled" ? "error" : s === "Processing" ? "processing" : "warning";

const OrdersPage = () => {
  const [loading, setLoading] = useState(false);
  const [allOrders, setAllOrders] = useState([]);    // raw from API
  const [orders, setOrders] = useState([]);           // displayed (filtered)
  const [filter, setFilter] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [dateRange, setDateRange] = useState(null);
  const auth = JSON.parse(localStorage.getItem("auth"));
  const navigate = useNavigate();

  useEffect(() => {
    if (auth) fetchOrderHistory();
  }, []);

  // Re-apply frontend filters whenever any filter state changes
  useEffect(() => {
    applyFilters(allOrders);
  }, [filter, searchText, dateRange, allOrders]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const endpoint =
        auth.role === "admin"
          ? "/api/bills/get-bills"
          : `/api/bills/get-user-bills/${auth._id}`;
      const { data } = await axios.get(endpoint);
      const raw = auth.role === "admin" ? data : data.bills || [];
      const sorted = [...raw].sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllOrders(sorted);
    } catch (error) {
      console.error(error);
      message.error("Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = (raw) => {
    let result = [...raw];
    const now = new Date();

    // Date quick-filter
    if (filter === "today") {
      const todayStr = now.toDateString();
      result = result.filter((o) => new Date(o.date).toDateString() === todayStr);
    } else if (filter === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      result = result.filter((o) => new Date(o.date) >= weekAgo);
    } else if (filter === "monthly") {
      result = result.filter((o) => {
        const d = new Date(o.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      });
    }

    // Custom date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      const from = dateRange[0].startOf("day").toDate();
      const to = dateRange[1].endOf("day").toDate();
      result = result.filter((o) => {
        const d = new Date(o.date);
        return d >= from && d <= to;
      });
    }

    // Search: Order ID, Customer Name, Phone
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      result = result.filter(
        (o) =>
          o._id?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          String(o.customerNumber || "").includes(q)
      );
    }

    setOrders(result);
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      key: "_id",
      render: (id) => (
        <Text strong style={{ fontFamily: "monospace", color: "var(--primary)" }}>
          #{id.slice(-6).toUpperCase()}
        </Text>
      ),
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      key: "customerName",
      render: (n) => <Text strong>{n}</Text>,
    },
    {
      title: "Phone",
      dataIndex: "customerNumber",
      key: "customerNumber",
      render: (p) => <Text style={{ color: "var(--text-secondary)" }}>{p}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (d) => (
        <Space>
          <CalendarOutlined style={{ color: "var(--text-muted)" }} />
          {new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
        </Space>
      ),
      sorter: (a, b) => new Date(b.date) - new Date(a.date),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      key: "totalAmount",
      render: (a) => (
        <Text strong style={{ color: "var(--primary)", fontSize: 15 }}>
          ₹{Number(a).toFixed(2)}
        </Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Payment",
      dataIndex: "paymentMode",
      key: "paymentMode",
      render: (m) => <Tag color="blue">{m?.toUpperCase()}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Processing", value: "Processing" },
        { text: "Completed", value: "Completed" },
        { text: "Cancelled", value: "Cancelled" },
      ],
      onFilter: (v, r) => (r.status || "Pending") === v,
      render: (s) => (
        <Tag color={statusColor(s)} style={{ fontWeight: 600 }}>
          {s || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "action",
      render: (record) => (
        <Space>
          <Button size="small" onClick={() => navigate(`/order-details/${record._id}`)}>
            View
          </Button>
          <Button
            size="small"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => navigate(`/order-details/${record._id}`)}
          >
            Invoice
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div style={{ padding: "0 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <Title level={2} style={{ margin: 0, color: "var(--text-primary)" }}>
            <ShoppingOutlined style={{ marginRight: 12 }} />
            {auth.role === "admin" ? "All Orders" : "My Orders"}
          </Title>
          <Button icon={<ReloadOutlined />} onClick={fetchOrderHistory} loading={loading}>
            Refresh
          </Button>
        </div>

        {/* Filters Bar */}
        <Card className="glass-morph" style={{ marginBottom: 20 }} bodyStyle={{ padding: "16px 20px" }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} lg={7}>
              <Input
                prefix={<SearchOutlined style={{ color: "var(--text-muted)" }} />}
                placeholder="Search by Order ID, Customer, Phone..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ borderRadius: 10, height: 42 }}
              />
            </Col>
            <Col xs={24} sm={12} lg={5}>
              <Select
                value={filter}
                onChange={(val) => setFilter(val)}
                style={{ width: "100%" }}
                suffixIcon={<FilterOutlined />}
              >
                <Select.Option value="all">📋 All Orders</Select.Option>
                <Select.Option value="today">📅 Today</Select.Option>
                <Select.Option value="week">📆 This Week</Select.Option>
                <Select.Option value="monthly">🗓 This Month</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={24} lg={9}>
              <RangePicker
                style={{ width: "100%", borderRadius: 10 }}
                onChange={(dates) => { setDateRange(dates); setFilter("all"); }}
                placeholder={["From Date", "To Date"]}
              />
            </Col>
            <Col xs={24} sm={12} lg={3}>
              <Button
                block
                onClick={() => { setSearchText(""); setFilter("all"); setDateRange(null); }}
              >
                Clear
              </Button>
            </Col>
          </Row>
          <div style={{ marginTop: 12, color: "var(--text-secondary)", fontSize: 13 }}>
            Showing <b>{orders.length}</b> of <b>{allOrders.length}</b> orders
          </div>
        </Card>

        {/* Table */}
        <Card className="glass-morph">
          <Table
            columns={columns}
            dataSource={orders}
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (t) => `${t} orders` }}
            scroll={{ x: 800 }}
          />
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default OrdersPage;
