import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { Table, Button, Tag, Space, Select, message, Input, Card, Typography } from "antd";
import { EyeOutlined, SearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import API from "../api";

const { Title, Text } = Typography;
const { Option } = Select;

const OrderManagement = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const getAllOrders = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/bills/get-bills");
      setOrders(data.sort((a, b) => new Date(b.date) - new Date(a.date)));
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      message.error("Error fetching orders");
    }
  };

  useEffect(() => {
    getAllOrders();
  }, []);

  const handleStatusUpdate = async (value, id) => {
    try {
      setLoading(true);
      const { data } = await API.put(`/api/bills/update-status/${id}`, { status: value });
      if (data.success) {
        message.success(data.message);
        getAllOrders();
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      message.error("Error updating status");
    }
  };

  const columns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      render: (id) => <Text strong>#{id.slice(-6).toUpperCase()}</Text>,
    },
    {
      title: "Customer",
      dataIndex: "customerName",
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (date) => new Date(date).toLocaleDateString(),
      sorter: (a, b) => new Date(a.date) - new Date(b.date),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      render: (amount) => <Text strong>₹{amount}</Text>,
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: "Payment",
      dataIndex: "paymentMode",
      render: (mode) => (
        <Tag color={mode === "cash" ? "orange" : "blue"}>{mode.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (status, record) => (
        <Select
          defaultValue={status || "Pending"}
          style={{ width: 120 }}
          onChange={(value) => handleStatusUpdate(value, record._id)}
          className={`status-select ${status?.toLowerCase()}`}
        >
          <Option value="Pending">Pending</Option>
          <Option value="Completed">Completed</Option>
          <Option value="Cancelled">Cancelled</Option>
        </Select>
      ),
    },
    {
      title: "Actions",
      render: (record) => (
        <Button
          type="primary"
          ghost
          icon={<EyeOutlined />}
          onClick={() => navigate(`/order-details/${record._id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(searchText.toLowerCase()) ||
      order._id.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <DefaultLayout>
      <div className="order-management-container" style={{ padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Title level={2}>
            <ShoppingCartOutlined style={{ marginRight: 12 }} />
            Order Management
          </Title>
          <Input
            placeholder="Search by ID or Customer Name..."
            prefix={<SearchOutlined />}
            style={{ width: 300 }}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
          />
        </div>

        <Card className="glass-morph">
          <Table
            columns={columns}
            dataSource={filteredOrders}
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </Card>
      </div>
    </DefaultLayout>
  );
};

export default OrderManagement;
