import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import API from "../api";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import {
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
  CreditCardOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Table, Button, Modal, message, Form, Input, Select, Card, Row, Col, Divider, Space, Tag } from "antd";

const CartPage = () => {
  const [subTotal, setSubTotal] = useState(0);
  const [billPopup, setBillPopup] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { cartItems } = useSelector((state) => state.rootReducer);

  //handle increment
  const handleIncreament = (record) => {
    dispatch({
      type: "UPDATE_CART",
      payload: { ...record, quantity: record.quantity + 1 },
    });
  };

  const handleDecreament = (record) => {
    if (record.quantity !== 1) {
      dispatch({
        type: "UPDATE_CART",
        payload: { ...record, quantity: record.quantity - 1 },
      });
    }
  };

  const columns = [
    {
      title: "Product",
      dataIndex: "name",
      render: (text, record) => (
        <Space>
          <img src={record.image} alt={text} height="40" width="40" style={{ borderRadius: 8, objectFit: "cover" }} />
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      render: (price) => <span>₹{price}</span>,
    },
    {
      title: "Quantity",
      dataIndex: "_id",
      render: (id, record) => (
        <div className="quantity-controls">
          <Button
            size="small"
            icon={<MinusOutlined />}
            onClick={() => handleDecreament(record)}
            style={{ borderRadius: 4 }}
          />
          <b style={{ margin: "0 12px", minWidth: 20, display: "inline-block", textAlign: "center" }}>{record.quantity}</b>
          <Button
            size="small"
            icon={<PlusOutlined />}
            onClick={() => handleIncreament(record)}
            style={{ borderRadius: 4 }}
          />
        </div>
      ),
    },
    {
      title: "Total",
      render: (record) => <span style={{ fontWeight: 700 }}>₹{(record.quantity * record.price).toFixed(2)}</span>,
    },
    {
      title: "Action",
      dataIndex: "_id",
      render: (id, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() =>
            dispatch({
              type: "DELETE_FROM_CART",
              payload: record,
            })
          }
        />
      ),
    },
  ];

  useEffect(() => {
    let temp = 0;
    cartItems.forEach((item) => (temp = temp + item.price * item.quantity));
    setSubTotal(temp);
  }, [cartItems]);

  const handleSubmit = async (value) => {
    try {
      const newObject = {
        ...value,
        cartItems,
        subTotal,
        tax: Number(((subTotal / 100) * 10).toFixed(2)),
        totalAmount: Number(
          (
            Number(subTotal) + Number(((subTotal / 100) * 10).toFixed(2))
          ).toFixed(2)
        ),
        userId: JSON.parse(localStorage.getItem("auth"))?._id,
      };
      await API.post("/api/bills/add-bills", newObject);
      dispatch({ type: "CLEAR_CART" });
      message.success("Order placed successfully! 🎉");
      navigate("/orders");
    } catch (error) {
      message.error("Something went wrong");
      console.log(error);
    }
  };

  return (
    <DefaultLayout>
      <div className="cart-container" style={{ padding: "0 24px" }}>
        <h1 style={{ marginBottom: 24, fontSize: 24, color: 'var(--text-primary)' }}>Order Bill Details</h1>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card className="glass-morph" bodyStyle={{ padding: 0 }}>
              <Table
                columns={columns}
                dataSource={cartItems}
                pagination={false}
                rowKey="_id"
                scroll={{ x: 600 }}
                locale={{ emptyText: <Empty description="Your cart is empty" /> }}
              />
            </Card>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="glass-morph invoice-card">
              <h3 style={{ marginBottom: 20, color: 'var(--text-primary)' }}>Order Summary</h3>
              <div className="order-details">
                <div className="d-flex justify-content-between mb-2">
                  <span>Subtotal</span>
                  <span style={{ fontWeight: 600 }}>₹{subTotal.toFixed(2)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tax (GST 10%)</span>
                  <span style={{ fontWeight: 600 }}>₹{((subTotal / 100) * 10).toFixed(2)}</span>
                </div>
                <Divider style={{ margin: "16px 0" }} />
                <div className="d-flex justify-content-between mb-4" style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
                  <span>Grand Total</span>
                  <span style={{ color: "var(--primary)" }}>₹{(subTotal * 1.1).toFixed(2)}</span>
                </div>
                <Button
                  type="primary"
                  size="large"
                  block
                  disabled={cartItems.length === 0}
                  onClick={() => setBillPopup(true)}
                  style={{ height: 50, borderRadius: 12, fontWeight: 700 }}
                >
                  Confirm & Generate Bill
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      <Modal
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CreditCardOutlined style={{ color: "var(--primary-color)" }} />
            <span>Customer Information</span>
          </div>
        }
        visible={billPopup}
        onCancel={() => setBillPopup(false)}
        footer={false}
        width={450}
        closeIcon={<div className="close-btn" />}
      >
        <Form layout="vertical" onFinish={handleSubmit} style={{ marginTop: 20 }}>
          <Form.Item
            name="customerName"
            label="Customer Name"
            rules={[{ required: true, message: "Please enter customer name" }]}
          >
            <Input prefix={<UserOutlined style={{ color: "#bfbfbf" }} />} placeholder="John Doe" />
          </Form.Item>
          <Form.Item
            name="customerNumber"
            label="Contact Number"
            rules={[{ required: true, message: "Please enter contact number" }]}
          >
            <Input prefix={<PhoneOutlined style={{ color: "#bfbfbf" }} />} placeholder="9988776655" />
          </Form.Item>

          <Form.Item
            name="paymentMode"
            label="Payment Method"
            rules={[{ required: true, message: "Please select payment method" }]}
          >
            <Select placeholder="Select Payment Mode">
              <Select.Option value="cash">
                <Space><DollarOutlined /> Cash</Space>
              </Select.Option>
              <Select.Option value="card">
                <Space><CreditCardOutlined /> Card / UPI</Space>
              </Select.Option>
            </Select>
          </Form.Item>

          <div className="bill-summary-mini" style={{ background: "var(--bg-main)", padding: 16, borderRadius: 12, marginBottom: 24, border: '1px solid var(--border-color)' }}>
            <div className="d-flex justify-content-between">
              <span style={{ color: "var(--text-secondary)" }}>Payable Amount</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-primary)' }}>₹{(subTotal * 1.1).toFixed(2)}</span>
            </div>
          </div>

          <div className="d-flex justify-content-end gap-3">
            <Button onClick={() => setBillPopup(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" style={{ borderRadius: 8 }}>
              Complete Transaction
            </Button>
          </div>
        </Form>
      </Modal>
    </DefaultLayout>
  );
};

const Empty = ({ description }) => (
  <div style={{ textAlign: "center", padding: "40px 0" }}>
    <ShoppingCartOutlined style={{ fontSize: 48, color: "var(--border-color)", marginBottom: 16 }} />
    <p style={{ color: "var(--text-muted)" }}>{description}</p>
    <Button type="primary" onClick={() => window.location.href = "/"}>Start Shopping</Button>
  </div>
);

export default CartPage;
