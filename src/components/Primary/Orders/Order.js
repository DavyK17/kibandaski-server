import { useState, useEffect } from "react";
import Skeleton from "react-loading-skeleton";

import { Customer } from "../../../api/Server";
import capitalise from "../../../util/capitalise";
import renderOrderTime from "../../../util/renderOrderTime";

const Order = props => {
    // Destructure props and details
    const { details, windowWidth, iconHeight, cancelOrder } = props;
    const { id, createdAt, status } = details;

    // Define server
    const Server = Customer.orders;
    
    // Define order cancel icon
    const OrderCancel = (
        <svg className="iconOrderCancel" width={iconHeight} height={iconHeight} viewBox="0 0 24 24">
            <path className="pathOrderCancel" style={{ fill:"#ffffff" }} d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm5 15.538l-3.592-3.548 3.546-3.587-1.416-1.403-3.545 3.589-3.588-3.543-1.405 1.405 3.593 3.552-3.547 3.592 1.405 1.405 3.555-3.596 3.591 3.55 1.403-1.416z"/>
        </svg>
    )

    // Set state and define fetch function
    const [items, setItems] = useState([]);
    const [fetchItems, setFetchItems] = useState(false);

    const [isLoadingItems, setIsLoadingItems] = useState(false);
    const [error, setError] = useState(null);

    const fetchOrderItems = async() => {
        setIsLoadingItems(true);

        try {
            let order = await Server.getOrders(id);
            setItems(order.items);
        } catch (err) {
            setError(true);
            console.error(err);
        }

        setIsLoadingItems(false);
    }

    useEffect(() => {
        if (items.length === 0 && fetchItems) fetchOrderItems();
        // eslint-disable-next-line
    }, [fetchItems]);

    // Define function to view order items
    const viewItems = e => {
        e.preventDefault();
        setFetchItems(fetchItems ? false : true);

        const items = document.getElementById(`order-${id}-items`);
        items.classList.toggle("show");
    }

    // RENDERING
    // Order items
    const renderItems = () => {
        // Return error message if error
        if (error) return <p className="error">An error occurred loading order items. Kindly refresh the page and try again.</p>;

        // Return skeleton if loading items
        if (isLoadingItems) return <Skeleton containerTestId="order-items-loading" />;

        // Get total cost of order items
        let total = items.map(({ totalCost }) => totalCost).reduce((a, b) => a + b, 0);

        // Get order items
        let list = items.map(({ productId, name, quantity, totalCost}, i) => {
            return (
                <div key={i} className="item" id={`order-${id}-item-${productId}`}>
                    <p className="name">
                        <span>{name}</span><span className="times">&times;</span><span className="quantity">{quantity}</span>
                    </p>
                    <p className="price">
                        <span className="currency">Ksh</span><span>{totalCost}</span>
                    </p>
                </div>
            )
        });

        // Return order items
        return (
            <div id={`order-${id}-items`} className={`items${items.length === 0 ? "" : " show"}`} data-testid="order-items">
                {list}
                {
                    items.length === 0 ? null : (
                        <div className="item total" id={`order-${id}-total`}>
                            <p className="name">Total</p>
                            <p className="price">
                                <span className="currency">Ksh</span><span>{total}</span>
                            </p>
                        </div>
                    )
                }
            </div>
        )
    };

    // Component
    return (
        <>
            <div className="order-body">
                <div className="info">
                    <p className="id">#{id}</p>
                    <p className="time">{renderOrderTime(createdAt)}</p>
                    <button className="view-items" onClick={viewItems} aria-label={fetchItems ? "Hide items" : "View items"}>
                        {fetchItems ? "Hide items" : "View items"}
                    </button>
                    {renderItems()}
                </div>
            </div>
            <div className="order-footer">
                <p className="status" id={`order-${id}-status`}>{capitalise(status)}</p>
                {
                    status === "pending" ?
                        <button className="cancel-order" onClick={cancelOrder} aria-label="Cancel order">
                            {windowWidth > 991 ? "Cancel order" : OrderCancel}
                        </button> :
                        null
                }
            </div>
        </>
    )
}

export default Order;