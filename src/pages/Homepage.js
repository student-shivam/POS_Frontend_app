import React, { useState, useEffect } from "react";
import DefaultLayout from "./../components/DefaultLayout";
import API from "../api";
import { Row, Col, Input, Tag, Space, Card, Empty, Button } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { SearchOutlined, ShoppingCartOutlined, FireOutlined } from "@ant-design/icons";
import ItemList from "../components/ItemList";

const Homepage = () => {
  const [itemsData, setItemsData] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("drinks");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      name: "drinks",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/430/430561.png",
    },
    {
      name: "rice",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/3174/3174880.png",
    },
    {
      name: "noodles",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/1471/1471262.png",
    },
    {
      name: "snacks",
      imageUrl: "https://cdn-icons-png.flaticon.com/512/2553/2553691.png",
    },
  ];

  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.rootReducer);

  useEffect(() => {
    const getAllItems = async () => {
      try {
        dispatch({ type: "SHOW_LOADING" });
        const { data } = await API.get("/api/items/get-item");
        setItemsData(data);
        dispatch({ type: "HIDE_LOADING" });
      } catch (error) {
        dispatch({ type: "HIDE_LOADING" });
        console.log(error);
      }
    };
    getAllItems();
  }, [dispatch]);

  const filteredItems = itemsData
    .filter((i) => (selectedCategory ? i.category === selectedCategory : true))
    .filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <DefaultLayout>
      <div className="terminal-container">
        <div className="terminal-header" style={{ marginBottom: 24 }}>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Row justify="space-between" align="middle" gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <h1 style={{ margin: "0 0 8px 0", color: "var(--text-primary)", fontWeight: 900, fontSize: 32, letterSpacing: '-1px' }}>Order Menu</h1>
                <p style={{ color: "var(--text-secondary)", fontWeight: 700, fontSize: 16 }}>Select food items from the list below</p>
              </Col>
              <Col xs={24} md={8}>
                <Input
                  placeholder="Search items or scan barcode..."
                  prefix={<SearchOutlined />}
                  size="large"
                  style={{ borderRadius: 12, width: "100%" }}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </Col>
            </Row>

            <div className="category-scroll-container" style={{ display: "flex", overflowX: "auto", padding: "10px 0", gap: "12px" }}>
              <Tag
                color={selectedCategory === "" ? "blue" : ""}
                style={{ cursor: "pointer", padding: "8px 16px", borderRadius: 8, fontSize: 14, margin: 0 }}
                onClick={() => setSelectedCategory("")}
              >
                All Items
              </Tag>
              {categories.map((category) => (
                <div
                  key={category.name}
                  className={`category-item ${selectedCategory === category.name ? "active" : ""}`}
                  onClick={() => setSelectedCategory(category.name)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    background: selectedCategory === category.name ? "rgba(99, 102, 241, 0.1)" : "var(--card-bg)",
                    padding: "8px 16px",
                    borderRadius: 12,
                    cursor: "pointer",
                    border: selectedCategory === category.name ? "1px solid var(--primary)" : "1px solid var(--border-color)",
                    transition: "all 0.3s",
                    whiteSpace: "nowrap"
                  }}
                >
                  <img src={category.imageUrl} alt={category.name} height="24" width="24" style={{ marginRight: 8 }} />
                  <span style={{ fontWeight: 700, textTransform: "capitalize", color: selectedCategory === category.name ? "var(--primary)" : "var(--text-primary)" }}>{category.name}</span>
                </div>
              ))}
            </div>
          </Space>
        </div>

        <Row gutter={[16, 16]}>
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Col xs={24} sm={12} md={8} lg={6} xl={6} key={item._id}>
                <ItemList item={item} />
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Empty description="No products found in this category" />
            </Col>
          )}
        </Row>
      </div>
    </DefaultLayout>
  );
};

export default Homepage;
