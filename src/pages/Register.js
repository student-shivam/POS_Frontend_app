import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined, IdcardOutlined } from "@ant-design/icons";
import API from "../api";
import { useDispatch } from "react-redux";
import "../styles/Auth.css";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (value) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const res = await API.post("/api/users/register", value);
      dispatch({ type: "HIDE_LOADING" });
      
      if (res.data.success) {
        message.success("Registration Successful");
        navigate("/login");
      } else {
        message.error(res.data.message);
      }
    } catch (error) {
      dispatch({ type: "HIDE_LOADING" });
      message.error(error.response?.data?.message || "Something Went Wrong");
      console.log(error);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("auth")) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <div className="auth-image-container">
          <img 
            src="https://img.freepik.com/free-vector/registration-form-concept-illustration_114360-1425.jpg" 
            alt="Register" 
            style={{ width: '100%', borderRadius: 20 }}
          />
        </div>
        <div className="auth-welcome-text">
          <h1>Join POS Smart</h1>
          <p>Start managing your restaurant more efficiently with our modern and intuitive platform.</p>
        </div>
      </div>
      
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-dot"></div>
            RAVINDRA FOOD
          </div>
          <h2>Create Account</h2>
          <p className="subtitle">Join our community of successful businesses</p>
          
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item 
              name="name" 
              label="Full Name"
              rules={[{ required: true, message: "Please enter your full name" }]}
            >
              <Input prefix={<IdcardOutlined />} placeholder="John Doe" />
            </Form.Item>

            <Form.Item 
              name="userId" 
              label="User ID"
              rules={[{ required: true, message: "Please enter a unique User ID" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="john_doe_99" />
            </Form.Item>
            
            <Form.Item 
              name="password" 
              label="Password"
              rules={[
                { required: true, message: "Please enter your password" },
                { min: 6, message: "Password must be at least 6 characters" }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Form.Item 
              name="role" 
              label="Select Role"
              rules={[{ required: true, message: "Please select a role" }]}
            >
              <select className="role-select">
                <option value="customer">Customer</option>
                <option value="admin">Admin</option>
              </select>
            </Form.Item>

            <Button type="primary" htmlType="submit" block className="auth-btn">
              Register Now
            </Button>
            
            <div className="auth-footer">
              Already have an account? <Link to="/login">Login Here</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Register;
