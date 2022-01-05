import { useEffect, useMemo, useState } from 'react'
import styles from './Checkout.module.css'
import { LoadingIcon } from './Icons'
import { getProducts } from './dataService'

// You are provided with an incomplete <Checkout /> component.
// You are not allowed to add any additional HTML elements.
// You are not allowed to use refs.

// Once the <Checkout /> component is mounted, load the products using the getProducts function.
// Once all the data is successfully loaded, hide the loading icon.
// Render each product object as a <Product/> component, passing in the necessary props.
// Implement the following functionality:
//  - The add and remove buttons should adjust the ordered quantity of each product
//  - The add and remove buttons should be enabled/disabled to ensure that the ordered quantity can’t be negative and can’t exceed the available count for that product.
//  - The total shown for each product should be calculated based on the ordered quantity and the price
//  - The total in the order summary should be calculated
//  - For orders over $1000, apply a 10% discount to the order. Display the discount text only if a discount has been applied.
//  - The total should reflect any discount that has been applied
//  - All dollar amounts should be displayed to 2 decimal places
// You can view how the completed functionality should look at: https://drive.google.com/file/d/1o2Rz5HBOPOEp9DlvE9FWnLJoW9KUp5-C/view?usp=sharing

const Product = ({
  id,
  name,
  availableCount,
  price,
  orderedQuantity,
  total,
  handleOnChange,
}) => {
  const [quantityState, setQuantityState] = useState(orderedQuantity)
  const [totalState, setTotalState] = useState(total)

  useEffect(() => {
    setTotalState(total)
  }, [total])

  useEffect(() => {
    setTotalState(orderedQuantity)
  }, [orderedQuantity])

  const onQuantityChange = (type) => {
    let tempQuantity = quantityState
    if (type === 'add' && quantityState < availableCount) {
      tempQuantity = tempQuantity + 1
    }
    if (type === 'reduce' && quantityState > 0) {
      tempQuantity = tempQuantity - 1
    }
    setQuantityState(tempQuantity)
    setTotalState((tempQuantity * price).toFixed(2))
    handleOnChange(id, tempQuantity)
  }

  return (
    <tr>
      <td>{id}</td>
      <td>{name}</td>
      <td>{availableCount}</td>
      <td>${price}</td>
      <td>{quantityState}</td>
      <td>${totalState}</td>
      <td>
        <button
          className={styles.actionButton}
          onClick={() => onQuantityChange('add')}
          disabled={quantityState >= availableCount}
        >
          +
        </button>
        <button
          className={styles.actionButton}
          onClick={() => onQuantityChange('reduce')}
          disabled={quantityState <= 0}
        >
          -
        </button>
      </td>
    </tr>
  )
}

const Checkout = () => {
  const [status, setStatus] = useState('idle')
  const [products, setProducts] = useState([])
  const [totalPrice, setTotalPrice] = useState(0)
  const [discountPrice, setDiscountPrice] = useState(0)
  const fetchProducts = async () => {
    setStatus('loading')
    const response = await getProducts()
    if (response) {
      setStatus('succeeded')
      const tempProduct = response.map((product) => ({
        ...product,
        total: 0,
        orderedQuantity: 0,
      }))
      setProducts(tempProduct)
    } else {
      setStatus('failed')
      setProducts([])
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleOnChange = (id, quantity) => {
    const tempProduct = [...products]
    const index = tempProduct.findIndex((product) => product.id === id)
    tempProduct[index].quantity = quantity
    tempProduct[index].total = (quantity * tempProduct[index].price).toFixed(2)
    const price = tempProduct.reduce((prev, acc) => {
      return prev + parseFloat(acc.total)
    }, 0)
    setTotalPrice(price.toFixed(2))
    if (price > 1000) {
      setDiscountPrice(((price * 10) / 100).toFixed(2))
    } else {
      setDiscountPrice(0)
    }
    setProducts(tempProduct)
  }

  const finalPice = useMemo(() => {
    let price = totalPrice
    if (discountPrice > 0) {
      price = (parseFloat(totalPrice) - parseFloat(discountPrice)).toFixed(2)
    }
    return price
  }, [discountPrice, totalPrice])

  return (
    <div>
      <header className={styles.header}>
        <h1>Electro World</h1>
      </header>
      <main>
        {status === 'loading' ? (
          <LoadingIcon />
        ) : (
          <>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Product ID</th>
                  <th>Product Name</th>
                  <th># Available</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Total</th>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <Product
                    key={product.key}
                    id={product.id}
                    name={product.name}
                    availableCount={product.availableCount}
                    price={product.price}
                    orderedQuantity={product.orderedQuantity}
                    total={product.total}
                    handleOnChange={handleOnChange}
                  />
                ))}
              </tbody>
            </table>
            <h2>Order summary</h2>
            <p>Discount: ${discountPrice} </p>
            <p>Total: ${finalPice}</p>
          </>
        )}
      </main>
    </div>
  )
}

export default Checkout
