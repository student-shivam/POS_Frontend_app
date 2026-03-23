// Fixed CustomersPage.js
import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import {
  Table, Button, Input, Modal, Form, message, Popconfirm,
  Space, Tag, Card, Typography, Row, Col, Avatar,
} from "antd";
import {
  SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
  EyeOutlined, UserOutlined, TeamOutlined, PhoneOutlined,
} from "@ant-design/icons";
import API from "../api";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();


  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/api/customers");
      if (data.success) {
        setCustomers(data.customers);
      }
    } catch (err) {
      console.error(err);
      message.error("Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
    // eslint-disable-next-line
  }, []);

  const openAddModal = () => {
    setEditingCustomer(null);
    form.resetFields();
    setModalVisible(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue({
      name: customer.name,
      phone: customer.phone,
      email: customer.email || "",
      address: customer.address || "",
    });
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingCustomer(null);
  };

  const handleSubmit = async (values) => {
    try {
      setSubmitting(true);

      if (editingCustomer) {
        const { data } = await API.put(
          `/api/customers/${editingCustomer._id}`,
          values
        );
        if (data.success) {
          message.success(data.message);
          handleModalClose();
          fetchCustomers();
        } else {
          message.error(data.message);
        }
      } else {
        const { data } = await API.post("/api/customers", values);
        if (data.success) {
          message.success(data.message);
          handleModalClose();
          fetchCustomers();
        } else {
          message.error(data.message);
        }
      }
    } catch (err) {
      console.error(err);
      const errMsg =
        err?.response?.data?.message || "Failed to save customer";
      message.error(errMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await API.delete(`/api/customers/${id}`);
      if (data.success) {
        message.success(data.message);
        fetchCustomers();
      } else {
        message.error(data.message);
      }
    } catch (err) {
      message.error("Failed to delete customer");
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchText.toLowerCase()) ||
      c.phone.includes(searchText)
  );

  const columns = [
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <Space>
          <Avatar
            icon={<UserOutlined />}
            style={{ backgroundColor: "var(--primary)" }}
          />
          <div>
            <Text strong>{record.name}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              <PhoneOutlined /> {record.phone}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (email) => email || <Text type="secondary">—</Text>,
    },
    {
      title: "Address",
      dataIndex: "address",
      render: (addr) =>
        addr ? (
          <Text style={{ maxWidth: 160, display: "inline-block" }} ellipsis={{ tooltip: addr }}>
            {addr}
          </Text>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: "Total Orders",
      dataIndex: "totalOrders",
      sorter: (a, b) => a.totalOrders - b.totalOrders,
      render: (n) => <Tag color="blue">{n || 0}</Tag>,
    },
    {
      title: "Total Purchase",
      dataIndex: "totalPurchase",
      sorter: (a, b) => a.totalPurchase - b.totalPurchase,
      render: (amt) => (
        <Text strong style={{ color: "var(--primary)" }}>
          ₹{amt || 0}
        </Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            ghost
            icon={<EyeOutlined />}
            size="small"
            onClick={() => navigate(`/customer-details/${record._id}`)}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title="Delete this customer?"
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record._id)}
            okText="Yes, Delete"
            cancelText="Cancel"
            okButtonProps={{ danger: true }}
          >
            <Button danger icon={<DeleteOutlined />} size="small" />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <DefaultLayout>
      <div style={{ padding: "0 24px" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined style={{ marginRight: 12 }} />
            Customer Management
          </Title>
          <Space>
            <Input
              placeholder="Search by name or phone..."
              prefix={<SearchOutlined />}
              style={{ width: 260 }}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
            >
              Add Customer
            </Button>
          </Space>
        </div>

        {/* Stats Row */}
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card className="glass-morph" style={{ textAlign: "center" }}>
              <Title level={3} style={{ color: "var(--primary)", margin: 0 }}>
                {customers.length}
              </Title>
              <Text type="secondary">Total Customers</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="glass-morph" style={{ textAlign: "center" }}>
              <Title level={3} style={{ color: "var(--primary)", margin: 0 }}>
                {customers.reduce((s, c) => s + (c.totalOrders || 0), 0)}
              </Title>
              <Text type="secondary">Total Orders</Text>
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className="glass-morph" style={{ textAlign: "center" }}>
              <Title level={3} style={{ color: "var(--primary)", margin: 0 }}>
                ₹{customers.reduce((s, c) => s + (c.totalPurchase || 0), 0)}
              </Title>
              <Text type="secondary">Total Revenue</Text>
            </Card>
          </Col>
        </Row>

        {/* Table */}
        <Card className="glass-morph">
          <Table
            columns={columns}
            dataSource={filteredCustomers}
            loading={loading}
            rowKey="_id"
            pagination={{ pageSize: 10, showSizeChanger: false }}
            scroll={{ x: true }}
          />
        </Card>
      </div>

      {/* Add / Edit Modal */}
      <Modal
        title={
          <Space>
            <UserOutlined />
            {editingCustomer ? "Edit Customer" : "Add New Customer"}
          </Space>
        }
        visible={modalVisible}
        onCancel={handleModalClose}
        footer={null}
        destroyOnClose
        width={480}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Customer Name"
            rules={[{ required: true, message: "Please enter customer name" }]}
          >
            <Input placeholder="Enter full name" prefix={<UserOutlined />} />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: "Please enter phone number" },
              {
                pattern: /^\d{7,15}$/,
                message: "Enter a valid phone number (digits only, 7-15 chars)",
              },
            ]}
          >
            <Input placeholder="e.g. 9876543210" prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email (optional)"
            rules={[{ type: "email", message: "Enter a valid email address" }]}
          >
            <Input placeholder="customer@example.com" />
          </Form.Item>

          <Form.Item name="address" label="Address (optional)">
            <Input.TextArea placeholder="Enter address" rows={3} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: "right" }}>
            <Space>
              <Button onClick={handleModalClose} disabled={submitting}>
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingCustomer ? "Update Customer" : "Add Customer"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

export default CustomersPage;
