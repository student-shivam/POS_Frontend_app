import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card, Table, Typography, Tag, Space, Button, Row, Col,
  Divider, message, Descriptions, Spin, Modal
} from "antd";
import {
  ArrowLeftOutlined, DownloadOutlined, ShoppingOutlined,
  UserOutlined, CalendarOutlined, CreditCardOutlined,
  PrinterOutlined, CheckCircleOutlined
} from "@ant-design/icons";
import API from "../api";
import { useReactToPrint } from "react-to-print";

const { Title, Text } = Typography;

// ─── Printable Thermal Receipt Component ─────────────────────────────────────
const ThermalReceipt = React.forwardRef(({ bill, store }, ref) => {
  if (!bill) return null;
  const subTotal = bill.subTotal || (bill.totalAmount - (bill.tax || 0));

  return (
    <div ref={ref} style={{
      width: "80mm", /* Standard thermal receipt width */
      padding: "20px 15px",
      margin: "0 auto",
      fontFamily: "'Courier New', Courier, monospace",
      backgroundColor: "#fff",
      color: "#000",
      fontSize: "12px",
      lineHeight: "1.4",
      boxSizing: "border-box",
      boxShadow: "none",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        {store?.storeLogo && (
          <img src={store.storeLogo} alt="Logo" style={{ maxWidth: "60px", marginBottom: "8px", filter: "grayscale(100%)" }} />
        )}
        <div style={{ fontSize: "16px", fontWeight: "bold", textTransform: "uppercase", marginBottom: "4px" }}>
          {store?.storeName || "RAVINDRA FOOD"}
        </div>
        {store?.storeAddress && <div style={{ fontSize: "11px" }}>{store.storeAddress}</div>}
        {store?.storePhone && <div style={{ fontSize: "11px" }}>Ph: {store.storePhone}</div>}
        {store?.storeEmail && <div style={{ fontSize: "11px" }}>{store.storeEmail}</div>}
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      {/* Invoice Details */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span>Date:</span>
        <span>{new Date(bill.date).toLocaleDateString("en-IN")} {new Date(bill.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span>Inv. No:</span>
        <span>#{bill._id?.slice(-8).toUpperCase()}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span>Payment:</span>
        <span>{bill.paymentMode?.toUpperCase()}</span>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      {/* Customer Details */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span>Customer:</span>
        <span>{bill.customerName}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span>Phone:</span>
        <span>{bill.customerNumber}</span>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      {/* Items Table */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "8px" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", borderBottom: "1px dashed #000", paddingBottom: "4px", width: "45%" }}>Item</th>
            <th style={{ textAlign: "center", borderBottom: "1px dashed #000", paddingBottom: "4px", width: "15%" }}>Qty</th>
            <th style={{ textAlign: "right", borderBottom: "1px dashed #000", paddingBottom: "4px", width: "20%" }}>Price</th>
            <th style={{ textAlign: "right", borderBottom: "1px dashed #000", paddingBottom: "4px", width: "20%" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {bill.cartItems?.map((item, i) => (
            <tr key={i}>
              <td style={{ paddingTop: "6px", verticalAlign: "top" }}>{item.name}</td>
              <td style={{ paddingTop: "6px", textAlign: "center", verticalAlign: "top" }}>{item.quantity}</td>
              <td style={{ paddingTop: "6px", textAlign: "right", verticalAlign: "top" }}>{Number(item.price).toFixed(2)}</td>
              <td style={{ paddingTop: "6px", textAlign: "right", verticalAlign: "top" }}>{(Number(item.quantity) * Number(item.price)).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      {/* Totals Section */}
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span>Subtotal</span>
        <span>₹{subTotal.toFixed(2)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
        <span>Tax ({store?.taxPercentage || 0}%)</span>
        <span>₹{(bill.tax || 0).toFixed(2)}</span>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "bold", fontSize: "14px", marginBottom: "8px" }}>
        <span>Grand Total</span>
        <span>₹{Number(bill.totalAmount).toFixed(2)}</span>
      </div>

      <div style={{ borderTop: "1px dashed #000", margin: "8px 0" }}></div>

      {/* Footer message */}
      <div style={{ textAlign: "center", marginTop: "16px", fontWeight: "bold" }}>
        <p style={{ margin: "2px 0" }}>Thank you for your purchase.</p>
        <p style={{ margin: "2px 0" }}>Visit Again!</p>
      </div>
    </div>
  );
});

// ─── Main Component ────────────────────────────────────────────────────────
const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bill, setBill] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const printRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [billRes, storeRes] = await Promise.all([
          API.get(`/api/bills/get-bill/${id}`),
          API.get("/api/settings/store").catch(() => ({ data: { settings: {} } })),
        ]);
        if (billRes.data.success) setBill(billRes.data.bill);
        if (storeRes.data.success) setStore(storeRes.data.settings);
      } catch (error) {
        console.error(error);
        message.error("Failed to fetch order details");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: `Receipt-${bill?._id?.slice(-8)}`,
  });

  const columns = [
    { title: "Item", dataIndex: "name", key: "name", render: (n) => <Text strong>{n}</Text> },
    { title: "Price", dataIndex: "price", key: "price", render: (p) => `₹${p}` },
    {
      title: "Qty", dataIndex: "quantity", key: "quantity",
      render: (q) => <Tag color="blue">×{q}</Tag>,
    },
    {
      title: "Total", key: "total",
      render: (r) => <Text strong style={{ color: "var(--primary)" }}>₹{(r.quantity * r.price).toFixed(2)}</Text>,
    },
  ];

  const statusColor = (s) =>
    s === "Completed" ? "success" : s === "Cancelled" ? "error" : s === "Processing" ? "processing" : "warning";

  if (loading) return <DefaultLayout><div style={{ display: "flex", justifyContent: "center", padding: 80 }}><Spin size="large" /></div></DefaultLayout>;
  if (!bill) return <DefaultLayout><div style={{ padding: 40, color: "var(--text-secondary)" }}>Order not found.</div></DefaultLayout>;

  return (
    <DefaultLayout>
      <div style={{ padding: "0 24px" }}>
        {/* Page Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Space>
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} />
            <Title level={2} style={{ margin: 0, color: "var(--text-primary)" }}>Order Details</Title>
            <Tag color={statusColor(bill.status)} style={{ fontSize: 13, padding: "3px 12px" }}>
              {bill.status || "Pending"}
            </Tag>
          </Space>
          <Space>
            <Button type="primary" icon={<PrinterOutlined />} onClick={() => setIsModalVisible(true)}>
              Print Invoice
            </Button>
          </Space>
        </div>

        <Row gutter={[24, 24]}>
          {/* Items Table */}
          <Col xs={24} lg={16}>
            <Card
              className="glass-morph"
              title={<span><ShoppingOutlined style={{ marginRight: 8 }} />Order Items</span>}
            >
              <Table
                columns={columns}
                dataSource={bill.cartItems}
                pagination={false}
                rowKey={(r, i) => i}
                footer={() => (
                  <div style={{ textAlign: "right", paddingRight: 32 }}>
                    <div style={{ marginBottom: 6, color: "var(--text-secondary)" }}>
                      Subtotal: <b>₹{(bill.subTotal || bill.totalAmount - (bill.tax || 0)).toFixed(2)}</b>
                    </div>
                    <div style={{ marginBottom: 6, color: "var(--text-secondary)" }}>
                      Tax: <b>₹{(bill.tax || 0).toFixed(2)}</b>
                    </div>
                    <Divider style={{ margin: "10px 0" }} />
                    <div style={{ fontSize: 18, fontWeight: 800, color: "var(--primary)" }}>
                      Total: ₹{Number(bill.totalAmount).toFixed(2)}
                    </div>
                  </div>
                )}
              />
            </Card>
          </Col>

          {/* Sidebar Info */}
          <Col xs={24} lg={8}>
            <Space direction="vertical" style={{ width: "100%" }} size="large">
              <Card className="glass-morph" title={<span><UserOutlined style={{ marginRight: 8 }} />Customer</span>}>
                <Descriptions column={1} labelStyle={{ color: "var(--text-muted)" }}>
                  <Descriptions.Item label="Name">{bill.customerName}</Descriptions.Item>
                  <Descriptions.Item label="Phone">{bill.customerNumber}</Descriptions.Item>
                  <Descriptions.Item label="Order ID">
                    <Text copyable style={{ fontSize: 12 }}>{bill._id}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>

              <Card className="glass-morph" title={<span><CalendarOutlined style={{ marginRight: 8 }} />Summary</span>}>
                <Descriptions column={1} labelStyle={{ color: "var(--text-muted)" }}>
                  <Descriptions.Item label="Date">{new Date(bill.date).toLocaleString()}</Descriptions.Item>
                  <Descriptions.Item label="Payment">
                    <Tag color="blue" icon={<CreditCardOutlined />}>{bill.paymentMode?.toUpperCase()}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Status">
                    <Tag color={statusColor(bill.status)} icon={<CheckCircleOutlined />}>
                      {bill.status || "Pending"}
                    </Tag>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            </Space>
          </Col>
        </Row>
      </div>

      {/* ── Invoice Preview Modal ── */}
      <Modal
        title="Invoice Preview"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>
            Close
          </Button>,
          <Button key="print" type="primary" icon={<PrinterOutlined />} onClick={handlePrint}>
            Print Receipt
          </Button>,
        ]}
        width={380} // Width to fit the 80mm thermal receipt preview nicely
        bodyStyle={{ display: "flex", justifyContent: "center", background: "#f0f2f5", padding: "20px" }}
      >
        <div style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          <ThermalReceipt ref={printRef} bill={bill} store={store} />
        </div>
      </Modal>

    </DefaultLayout>
  );
};

export default OrderDetails;
