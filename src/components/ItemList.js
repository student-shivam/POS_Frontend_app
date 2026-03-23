import React from "react";
import { Button, Card, Tag, message } from "antd";
import { useDispatch } from "react-redux";
import { PlusOutlined } from "@ant-design/icons";

const ItemList = ({ item }) => {
  const dispatch = useDispatch();

  //update cart handler
  const handleAddTOCart = () => {
    dispatch({
      type: "ADD_TO_CART",
      payload: { ...item, quantity: 1 },
    });
    message.success("Item Added Successfully");
  };

  return (
    <Card
      hoverable
      className="item-card glass-morph"
      cover={
        <div style={{ height: 180, overflow: "hidden", borderRadius: "12px 12px 0 0" }}>
          <img
            alt={item.name}
            src={item.image}
            style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.5s" }}
            className="card-image"
          />
        </div>
      }
      bodyStyle={{ padding: "16px" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <h4 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: "var(--text-primary)" }}>{item.name}</h4>
        <Tag color="green" style={{ fontWeight: 700, fontSize: 13, border: "1px solid #b7eb8f", background: 'rgba(34, 197, 94, 0.1)' }}>₹{item.price}</Tag>
      </div>
      <p style={{ color: "var(--text-secondary)", fontSize: 13, fontWeight: 600, marginBottom: 16, textTransform: "capitalize" }}>
        {item.category}
      </p>
      <Button
        type="primary"
        block
        icon={<PlusOutlined />}
        onClick={() => handleAddTOCart()}
        className="add-cart-btn"
        style={{ borderRadius: 8, fontWeight: 600 }}
      >
        Add to Order
      </Button>
    </Card>
  );
};

export default ItemList;
