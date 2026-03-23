import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, Table, Typography, Tag, Space, Button, Row, Col,
  Descriptions, Avatar, message, Divider, Statistic,
} from "antd";
import {
  ArrowLeftOutlined, UserOutlined, PhoneOutlined,
  MailOutlined, HomeOutlined, ShoppingOutlined, CalendarOutlined,
} from "@ant-design/icons";
import API from "../api";

const { Title, Text } = Typography;

const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/api/customers/${id}`);
        if (data.success) {
          setCustomer(data.customer);
          setOrders(data.orders);
        } else {
          message.error("Customer not found");
        }
      } catch (err) {
        message.error("Failed to load customer details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const orderColumns = [
    {
      title: "Order ID",
      dataIndex: "_id",
      render: (id) => <Text strong>#{id.slice(-6).toUpperCase()}</Text>,
    },
    {
      title: "Date",
      dataIndex: "date",
      render: (d) => (
        <Space>
          <CalendarOutlined style={{ color: "var(--text-muted)" }} />
          {new Date(d).toLocaleDateString()}
        </Space>
      ),
    },
    {
      title: "Amount",
      dataIndex: "totalAmount",
      render: (a) => (
        <Text strong style={{ color: "var(--primary)" }}>
          ₹{a}
        </Text>
      ),
    },
    {
      title: "Payment",
      dataIndex: "paymentMode",
      render: (m) => <Tag color="blue">{m?.toUpperCase()}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (s) => (
        <Tag color={s === "Completed" ? "success" : s === "Cancelled" ? "error" : "processing"}>
          {s || "Pending"}
        </Tag>
      ),
    },
    {
      title: "Details",
      render: (record) => (
        <Button size="small" onClick={() => navigate(`/order-details/${record._id}`)}>
          View
        </Button>
      ),
    },
  ];

  if (loading || !customer)
    return (
      <DefaultLayout>
        <div style={{ padding: "24px", color: "var(--text-primary)" }}>
          {loading ? "Loading..." : "Customer not found."}
        </div>
      </DefaultLayout>
    );

  return (
    <DefaultLayout>
      <div style={{ padding: "0 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <Title level={2} style={{ margin: 0 }}>
              Customer Profile
            </Title>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          {/* Profile Card */}
          <Col xs={24} lg={8}>
            <Card className="glass-morph" style={{ textAlign: "center" }}>
              <Avatar
                size={80}
                icon={<UserOutlined />}
                style={{ backgroundColor: "var(--primary)", marginBottom: 16 }}
              />
              <Title level={3} style={{ margin: "8px 0 4px" }}>
                {customer.name}
              </Title>

              <Divider />

              <Descriptions column={1} labelStyle={{ color: "var(--text-muted)" }}>
                <Descriptions.Item
                  label={
                    <span>
                      <PhoneOutlined /> Phone
                    </span>
                  }
                >
                  {customer.phone}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <MailOutlined /> Email
                    </span>
                  }
                >
                  {customer.email || "—"}
                </Descriptions.Item>
                <Descriptions.Item
                  label={
                    <span>
                      <HomeOutlined /> Address
                    </span>
                  }
                >
                  {customer.address || "—"}
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              <Row gutter={8}>
                <Col span={12}>
                  <Statistic
                    title="Total Orders"
                    value={customer.totalOrders}
                    valueStyle={{ color: "var(--primary)", fontSize: 24 }}
                  />
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Total Spent"
                    value={customer.totalPurchase}
                    prefix="₹"
                    valueStyle={{ color: "#52c41a", fontSize: 24 }}
                  />
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Orders Table */}
          <Col xs={24} lg={16}>
            <Card
              className="glass-morph"
              title={
                <span>
                  <ShoppingOutlined style={{ marginRight: 8 }} />
                  Order History
                </span>
              }
            >
              <Table
                columns={orderColumns}
                dataSource={orders}
                rowKey="_id"
                pagination={{ pageSize: 8 }}
                scroll={{ x: true }}
                locale={{ emptyText: "No orders found for this customer." }}
              />
            </Card>
          </Col>
        </Row>
      </div>
    </DefaultLayout>
  );
};

export default CustomerDetails;
