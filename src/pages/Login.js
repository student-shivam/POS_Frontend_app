import React, { useEffect } from "react";
import { Form, Input, Button, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import API from "../api";
import { useDispatch } from "react-redux";
import "../styles/Auth.css";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (value) => {
    try {
      dispatch({ type: "SHOW_LOADING" });
      const res = await API.post("/api/users/login", value);
      dispatch({ type: "HIDE_LOADING" });
      
      if (res.data.success) {
        message.success("Login Successful");
        const authData = { ...res.data.user, token: res.data.token };
        localStorage.setItem("auth", JSON.stringify(authData));
        localStorage.setItem("token", res.data.token); // Keep separate as well for compatibility
        
        // Role based redirect
        if (res.data.user.role === "admin") {
          navigate("/dashboard");
        } else {
          navigate("/");
        }
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
    const auth = JSON.parse(localStorage.getItem("auth"));
    if (auth) {
      navigate(auth.role === "admin" ? "/dashboard" : "/");
    }
  }, [navigate]);

  return (
    <div className="auth-container">
      <div className="auth-sidebar">
        <div className="auth-image-container">
          <img 
            src="https://img.freepik.com/free-vector/interaction-design-concept-illustration_114360-4972.jpg" 
            alt="Welcome" 
            style={{ width: '100%', borderRadius: 20 }}
          />
        </div>
        <div className="auth-welcome-text">
          <h1>Welcome Back</h1>
          <p>Elevate your business with the most powerful POS solution designed for modern restaurants.</p>
        </div>
      </div>
      
      <div className="auth-form-section">
        <div className="auth-card">
          <div className="auth-logo">
            <div className="logo-dot"></div>
            RAVINDRA FOOD
          </div>
          <h2>Login</h2>
          <p className="subtitle">Enter your credentials to access your account</p>
          
          <Form layout="vertical" onFinish={handleSubmit}>
            <Form.Item 
              name="userId" 
              label="User ID"
              rules={[{ required: true, message: "Please enter your User ID" }]}
            >
              <Input prefix={<UserOutlined />} placeholder="admin123" />
            </Form.Item>
            
            <Form.Item 
              name="password" 
              label="Password"
              rules={[{ required: true, message: "Please enter your password" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="••••••••" />
            </Form.Item>

            <Button type="primary" htmlType="submit" block className="auth-btn">
              Sign In
            </Button>
            
            <div className="auth-footer">
              Don't have an account? <Link to="/register">Register Here</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Login;
