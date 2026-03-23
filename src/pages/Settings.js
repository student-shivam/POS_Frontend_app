import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import {
  Card, Form, Input, Button, message, Upload, Avatar,
  Row, Col, Divider, Space, Typography, Switch, InputNumber,
  Tabs, Tag
} from "antd";
import {
  UserOutlined, MailOutlined, PhoneOutlined, LockOutlined,
  UploadOutlined, SaveOutlined, ShopOutlined, SettingOutlined,
  PercentageOutlined, HomeOutlined
} from "@ant-design/icons";
import API from "../api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Settings = () => {
  const [profileLoading, setProfileLoading] = useState(false);
  const [storeLoading, setStoreLoading] = useState(false);
  const [taxLoading, setTaxLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [storeLogo, setStoreLogo] = useState("");
  const [taxEnabled, setTaxEnabled] = useState(false);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [activeTab, setActiveTab] = useState(
    new URLSearchParams(window.location.search).get("tab") || "profile"
  );

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const [storeForm] = Form.useForm();

  const auth = JSON.parse(localStorage.getItem("auth"));

  useEffect(() => {
    // Populate profile form
    if (auth) {
      profileForm.setFieldsValue({
        name: auth.name,
        email: auth.email || "",
        phone: auth.phone || "",
      });
      setProfileImage(auth.image || "");
    }
    // Load store & tax settings
    fetchStoreSettings();
    fetchTaxSettings();
  }, []);

  const fetchStoreSettings = async () => {
    try {
      const { data } = await API.get("/api/settings/store");
      if (data.success) {
        storeForm.setFieldsValue({
          storeName: data.settings.storeName,
          storeAddress: data.settings.storeAddress,
          storePhone: data.settings.storePhone,
          storeEmail: data.settings.storeEmail,
        });
        setStoreLogo(data.settings.storeLogo || "");
      }
    } catch (e) { console.error(e); }
  };

  const fetchTaxSettings = async () => {
    try {
      const { data } = await API.get("/api/settings/tax");
      if (data.success) {
        setTaxEnabled(data.taxEnabled);
        setTaxPercentage(data.taxPercentage);
      }
    } catch (e) { console.error(e); }
  };

  // ── Profile Save ──
  const handleUpdateProfile = async (values) => {
    try {
      setProfileLoading(true);
      const { data } = await API.put("/api/admin/profile", {
        id: auth._id,
        ...values,
        image: profileImage,
      });
      if (data.success) {
        message.success("Profile updated!");
        const updated = { ...auth, ...data.user };
        localStorage.setItem("auth", JSON.stringify(updated));
        setTimeout(() => window.location.reload(), 600);
      }
    } catch { message.error("Failed to update profile"); }
    finally { setProfileLoading(false); }
  };

  // ── Password Change ──
  const handleChangePassword = async (values) => {
    try {
      setProfileLoading(true);
      const { data } = await API.put("/api/admin/change-password", {
        id: auth._id,
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });
      if (data.success) {
        message.success(data.message);
        passwordForm.resetFields();
      } else {
        message.error(data.message);
      }
    } catch { message.error("Failed to change password"); }
    finally { setProfileLoading(false); }
  };

  // ── Store Save ──
  const handleSaveStore = async (values) => {
    try {
      setStoreLoading(true);
      const { data } = await axios.put("/api/settings/store", { ...values, storeLogo });
      if (data.success) message.success("Store settings saved!");
    } catch { message.error("Failed to save store settings"); }
    finally { setStoreLoading(false); }
  };

  // ── Tax Save ──
  const handleSaveTax = async () => {
    try {
      setTaxLoading(true);
      const { data } = await axios.put("/api/settings/tax", { taxEnabled, taxPercentage });
      if (data.success) message.success("Tax settings saved!");
    } catch { message.error("Failed to save tax settings"); }
    finally { setTaxLoading(false); }
  };

  const handleImageUpload = (file, setter) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) { message.error("Image must be smaller than 2MB!"); return false; }
    const reader = new FileReader();
    reader.onload = (e) => setter(e.target.result);
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <DefaultLayout>
      <div style={{ padding: "0 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: "var(--text-primary)" }}>
            <SettingOutlined style={{ marginRight: 12 }} /> Admin Settings
          </Title>
          <Tag color="volcano" style={{ fontWeight: 700, padding: "4px 12px" }}>
            {auth?.role?.toUpperCase()}
          </Tag>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          {/* ─────── PROFILE TAB ─────── */}
          <TabPane tab={<span><UserOutlined />Profile</span>} key="profile">
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={7}>
                <Card className="glass-morph" style={{ textAlign: "center", padding: "32px 20px" }}>
                  <div style={{ position: "relative", display: "inline-block", marginBottom: 20 }}>
                    <Avatar
                      size={110}
                      src={profileImage}
                      icon={!profileImage && <UserOutlined />}
                      style={{ border: "4px solid var(--border-color)", background: "var(--bg-main)" }}
                    />
                    <Upload showUploadList={false} beforeUpload={(f) => handleImageUpload(f, setProfileImage)} accept="image/*">
                      <Button shape="circle" icon={<UploadOutlined />} size="small"
                        style={{ position: "absolute", bottom: 0, right: 0, background: "var(--primary)", color: "#fff", border: "none" }} />
                    </Upload>
                  </div>
                  <Title level={4} style={{ margin: "0 0 4px", color: "var(--text-primary)" }}>{auth?.name}</Title>
                  <Text style={{ color: "var(--text-secondary)" }}>{auth?.userId}</Text>
                </Card>
              </Col>

              <Col xs={24} lg={17}>
                <Card className="glass-morph">
                  <Title level={5} style={{ marginBottom: 20, color: "var(--text-primary)" }}>Personal Information</Title>
                  <Form layout="vertical" form={profileForm} onFinish={handleUpdateProfile}>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                          <Input prefix={<UserOutlined />} placeholder="Name" style={{ height: 44, borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="email" label="Email">
                          <Input prefix={<MailOutlined />} placeholder="Email" style={{ height: 44, borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="phone" label="Phone">
                      <Input prefix={<PhoneOutlined />} placeholder="+91 9988776655" style={{ height: 44, borderRadius: 8 }} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={profileLoading} icon={<SaveOutlined />} size="large">
                      Save Profile
                    </Button>
                  </Form>

                  <Divider style={{ margin: "36px 0" }} />

                  <Title level={5} style={{ marginBottom: 20, color: "var(--text-primary)" }}>Change Password</Title>
                  <Form layout="vertical" form={passwordForm} onFinish={handleChangePassword}>
                    <Form.Item name="oldPassword" label="Current Password" rules={[{ required: true }]}>
                      <Input.Password prefix={<LockOutlined />} placeholder="Current password" style={{ height: 44, borderRadius: 8 }} />
                    </Form.Item>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="newPassword" label="New Password" rules={[{ required: true, min: 6 }]}>
                          <Input.Password prefix={<LockOutlined />} placeholder="New password" style={{ height: 44, borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="confirm" label="Confirm Password"
                          dependencies={["newPassword"]}
                          rules={[{ required: true },
                            ({ getFieldValue }) => ({
                              validator(_, v) {
                                return !v || getFieldValue("newPassword") === v
                                  ? Promise.resolve()
                                  : Promise.reject("Passwords do not match");
                              },
                            }),
                          ]}>
                          <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" style={{ height: 44, borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Button htmlType="submit" loading={profileLoading} size="large">Update Password</Button>
                  </Form>
                </Card>
              </Col>
            </Row>
          </TabPane>

          {/* ─────── STORE TAB ─────── */}
          <TabPane tab={<span><ShopOutlined />Store Info</span>} key="store">
            <Card className="glass-morph">
              <Title level={5} style={{ marginBottom: 24, color: "var(--text-primary)" }}>
                <ShopOutlined style={{ marginRight: 8 }} /> Store Information
              </Title>
              <Text type="secondary" style={{ display: "block", marginBottom: 24 }}>
                This information appears on invoices and receipts.
              </Text>

              <Row gutter={[24, 0]}>
                <Col xs={24} lg={6}>
                  <div style={{ textAlign: "center", marginBottom: 24 }}>
                    <div style={{ marginBottom: 16 }}>
                      {storeLogo
                        ? <img src={storeLogo} alt="logo" style={{ width: 100, height: 100, objectFit: "contain", borderRadius: 12, border: "2px dashed var(--border-color)" }} />
                        : <div style={{ width: 100, height: 100, borderRadius: 12, border: "2px dashed var(--border-color)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", color: "var(--text-muted)" }}><ShopOutlined style={{ fontSize: 32 }} /></div>
                      }
                    </div>
                    <Upload showUploadList={false} beforeUpload={(f) => handleImageUpload(f, setStoreLogo)} accept="image/*">
                      <Button icon={<UploadOutlined />}>Upload Logo</Button>
                    </Upload>
                  </div>
                </Col>
                <Col xs={24} lg={18}>
                  <Form layout="vertical" form={storeForm} onFinish={handleSaveStore}>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item name="storeName" label="Store Name" rules={[{ required: true }]}>
                          <Input prefix={<ShopOutlined />} placeholder="RAVINDRA FOOD" style={{ height: 44, borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item name="storePhone" label="Store Phone">
                          <Input prefix={<PhoneOutlined />} placeholder="+91 9988776655" style={{ height: 44, borderRadius: 8 }} />
                        </Form.Item>
                      </Col>
                    </Row>
                    <Form.Item name="storeAddress" label="Store Address">
                      <Input prefix={<HomeOutlined />} placeholder="123 Main St, City" style={{ height: 44, borderRadius: 8 }} />
                    </Form.Item>
                    <Form.Item name="storeEmail" label="Store Email">
                      <Input prefix={<MailOutlined />} placeholder="store@example.com" style={{ height: 44, borderRadius: 8 }} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" loading={storeLoading} icon={<SaveOutlined />} size="large">
                      Save Store Info
                    </Button>
                  </Form>
                </Col>
              </Row>
            </Card>
          </TabPane>

          {/* ─────── TAX TAB ─────── */}
          <TabPane tab={<span><PercentageOutlined />Tax Settings</span>} key="tax">
            <Card className="glass-morph" style={{ maxWidth: 520 }}>
              <Title level={5} style={{ marginBottom: 24, color: "var(--text-primary)" }}>
                <PercentageOutlined style={{ marginRight: 8 }} /> Tax Configuration
              </Title>
              <Text type="secondary" style={{ display: "block", marginBottom: 28 }}>
                Tax is automatically applied to all invoices and bills when enabled.
              </Text>

              <Space direction="vertical" style={{ width: "100%" }} size="large">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-main)", padding: "16px 20px", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                  <div>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)" }}>Enable Tax</div>
                    <div style={{ color: "var(--text-secondary)", fontSize: 13 }}>Apply tax to all orders at checkout</div>
                  </div>
                  <Switch
                    checked={taxEnabled}
                    onChange={setTaxEnabled}
                    style={{ backgroundColor: taxEnabled ? "var(--primary)" : undefined }}
                  />
                </div>

                {taxEnabled && (
                  <div style={{ background: "var(--bg-main)", padding: "16px 20px", borderRadius: 12, border: "1px solid var(--border-color)" }}>
                    <div style={{ fontWeight: 700, color: "var(--text-primary)", marginBottom: 12 }}>Tax Percentage (%)</div>
                    <InputNumber
                      min={0}
                      max={100}
                      value={taxPercentage}
                      onChange={setTaxPercentage}
                      formatter={(v) => `${v}%`}
                      parser={(v) => v.replace("%", "")}
                      style={{ width: "100%", height: 44, borderRadius: 8 }}
                      size="large"
                    />
                    <Text type="secondary" style={{ fontSize: 13, marginTop: 8, display: "block" }}>
                      On a ₹1000 order: Tax = ₹{((taxPercentage / 100) * 1000).toFixed(0)}, Total = ₹{(1000 + (taxPercentage / 100) * 1000).toFixed(0)}
                    </Text>
                  </div>
                )}

                <Button
                  type="primary"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={taxLoading}
                  onClick={handleSaveTax}
                >
                  Save Tax Settings
                </Button>
              </Space>
            </Card>
          </TabPane>
        </Tabs>
      </div>
    </DefaultLayout>
  );
};

export default Settings;
