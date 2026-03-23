import React, { useState, useEffect } from "react";
import DefaultLayout from "../components/DefaultLayout";
import { Card, Form, Input, Button, message, Upload, Avatar, Row, Col, Divider, Space, Typography, Table, Tabs, Tag } from "antd";
import { 
  UserOutlined, MailOutlined, PhoneOutlined, LockOutlined, 
  UploadOutlined, SaveOutlined, HistoryOutlined, SettingOutlined,
  ShoppingOutlined, CalendarOutlined, CreditCardOutlined
} from "@ant-design/icons";
import API from "../api";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Profile = () => {
  const [loading, setLoading] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();
  
  const auth = JSON.parse(localStorage.getItem("auth"));

  useEffect(() => {
    if (auth) {
      form.setFieldsValue({
        name: auth.name,
        email: auth.email || "",
        phone: auth.phone || "",
      });
      setProfileImage(auth.image || "");
    }
  }, []);

  const handleUpdateProfile = async (values) => {
    try {
      setLoading(true);
      const { data } = await API.post("/api/users/update-profile", {
        id: auth?._id,
        userId: auth?.userId,
        ...values,
        image: profileImage,
      });
      
      if (data.success) {
        message.success(data.message);
        // Update both local storage components
        const updatedAuth = { ...auth, ...data.user };
        localStorage.setItem("auth", JSON.stringify(updatedAuth));
        
        // Use a more controlled way to refresh or update state
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Something went wrong";
      message.error(msg);
      console.error("Profile Update Error:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      const { data } = await API.post("/api/users/update-password", {
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
    } catch (error) {
      message.error("Invalid Old Password");
    } finally {
      setLoading(false);
    }
  };

  const handleBeforeUpload = (file) => {
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error("Image must be smaller than 2MB!");
      return false;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target.result);
    };
    reader.readAsDataURL(file);
    return false; // Prevent auto upload
  };

  return (
    <DefaultLayout>
      <div className="profile-container" style={{ padding: "0 24px" }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
          <Title level={2} style={{ margin: 0, color: 'var(--text-primary)' }}>
            <SettingOutlined style={{ marginRight: 12 }} />
            Profile Settings
          </Title>
        </div>
        
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={8}>
            <Card className="glass-morph shadow-sm" style={{ textAlign: "center", paddingTop: 40, position: "sticky", top: 24 }}>
              <div style={{ position: "relative", display: "inline-block", marginBottom: 24 }}>
                <Avatar 
                  size={120} 
                  src={profileImage} 
                  icon={<UserOutlined />} 
                  style={{ border: "4px solid var(--border-color)", boxShadow: "0 8px 16px rgba(0,0,0,0.1)", background: "var(--bg-main)" }}
                />
                <Upload
                  showUploadList={false}
                  beforeUpload={handleBeforeUpload}
                  accept="image/*"
                >
                  <Button 
                    shape="circle" 
                    icon={<UploadOutlined />} 
                    style={{ 
                      position: "absolute", 
                      bottom: 0, 
                      right: 0, 
                      background: "var(--primary)", 
                      color: "white",
                      border: "none",
                      boxShadow: "0 4px 12px rgba(99, 102, 241, 0.4)"
                    }} 
                  />
                </Upload>
              </div>
              <Title level={4} style={{ margin: "0 0 4px 0", color: 'var(--text-primary)' }}>{auth?.name}</Title>
              <Tag color={auth?.role === 'admin' ? 'volcano' : 'blue'} style={{ marginBottom: 24 }}>{auth?.role?.toUpperCase()}</Tag>
              
              <Divider />
              
              <div style={{ textAlign: "left" }}>
                <Space direction="vertical" style={{ width: "100%" }} size="middle">
                  <div>
                    <Text style={{ color: "var(--text-secondary)", fontSize: '12px' }}><UserOutlined style={{ marginRight: 4 }} /> User ID</Text>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{auth?.userId}</div>
                  </div>
                  <div>
                    <Text style={{ color: "var(--text-secondary)", fontSize: '12px' }}><MailOutlined style={{ marginRight: 4 }} /> Email Address</Text>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{auth?.email || "Not Provided"}</div>
                  </div>
                </Space>
              </div>
            </Card>
          </Col>

          <Col xs={24} lg={16}>
            <Card className="glass-morph shadow-sm" bodyStyle={{ padding: "24px" }}>
              <Title level={5} style={{ marginBottom: 24, color: 'var(--text-primary)' }}>Personal Information</Title>
              <Form layout="vertical" form={form} onFinish={handleUpdateProfile}>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
                      <Input prefix={<UserOutlined />} placeholder="Enter name" style={{ height: 45, borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="email" label="Email Address">
                      <Input prefix={<MailOutlined />} placeholder="ravindra@example.com" style={{ height: 45, borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item name="phone" label="Phone Number">
                  <Input prefix={<PhoneOutlined />} placeholder="+91 9988776655" style={{ height: 45, borderRadius: 8 }} />
                </Form.Item>
                <Button type="primary" htmlType="submit" loading={loading} icon={<SaveOutlined />} size="large">
                  Save Changes
                </Button>
              </Form>

              <Divider style={{ margin: "40px 0" }} />

              <Title level={5} style={{ marginBottom: 24, color: 'var(--text-primary)' }}>Security Settings</Title>
              <Form layout="vertical" form={passwordForm} onFinish={handleChangePassword}>
                <Form.Item name="oldPassword" label="Current Password" rules={[{ required: true }]}>
                  <Input.Password prefix={<LockOutlined />} placeholder="Enter current password" style={{ height: 45, borderRadius: 8 }} />
                </Form.Item>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item name="newPassword" label="New Password" rules={[{ required: true }]}>
                      <Input.Password prefix={<LockOutlined />} placeholder="New password" style={{ height: 45, borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="confirmPassword" 
                      label="Confirm Password" 
                      dependencies={['newPassword']}
                      rules={[
                        { required: true },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('newPassword') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Passwords do not match!'));
                          },
                        }),
                      ]}
                    >
                      <Input.Password prefix={<LockOutlined />} placeholder="Confirm password" style={{ height: 45, borderRadius: 8 }} />
                    </Form.Item>
                  </Col>
                </Row>
                <Button type="primary" htmlType="submit" loading={loading} size="large">
                  Update Password
                </Button>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </DefaultLayout>
  );
};

export default Profile;
