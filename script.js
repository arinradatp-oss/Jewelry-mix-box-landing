/**
 * ==========================================
 * HTML Element IDs and Selectors Reference:
 * ==========================================
 * - #boxSize         : <select> element for choosing box size ('S', 'M', 'L')
 * - .cat-checkbox    : Class for category checkboxes (Values: 'rope', 'bead', 'silver', 'gold')
 * - #totalPrice      : Element (span/div) to display the real-time calculated price
 * - #orderForm       : <form> element containing the inputs and submit button
 * ==========================================
 */

const BASE_PRICES = {
  'S': 250,
  'M': 390,
  'L': 550
};

const CATEGORY_MULTIPLIERS = {
  'rope': 1.0,   // เชือก
  'bead': 1.0,   // ลูกปัด
  'silver': 1.3, // เงิน
  'gold': 1.5    // ทอง
};

// DOM Elements
const boxSizeSelect = document.getElementById('boxSize');
const categoryCheckboxes = document.querySelectorAll('.cat-checkbox');
const totalPriceDisplay = document.getElementById('totalPrice');
const orderForm = document.getElementById('orderForm');

/**
 * Calculates the price in real-time based on selected size and categories.
 * Formula: Average Multiplier = Sum of multipliers / Number of selected categories
 * Final Price = Base Price * Average Multiplier
 */
function calculatePrice() {
  const selectedSize = boxSizeSelect.value;
  const basePrice = BASE_PRICES[selectedSize] || 0;

  const checkedCategories = Array.from(categoryCheckboxes).filter(cb => cb.checked);

  // Validation: Must select at least one category
  if (checkedCategories.length === 0) {
    totalPriceDisplay.textContent = 'กรุณาเลือกหมวดสินค้าอย่างน้อย 1 หมวด';
    return { valid: false, price: 0 };
  }

  let sumMultiplier = 0;
  checkedCategories.forEach(cb => {
    const catKey = cb.value;
    sumMultiplier += (CATEGORY_MULTIPLIERS[catKey] || 1.0);
  });

  const avgMultiplier = sumMultiplier / checkedCategories.length;
  const finalPrice = basePrice * avgMultiplier;

  totalPriceDisplay.textContent = finalPrice.toFixed(2);
  return { 
    valid: true, 
    price: finalPrice, 
    avgMultiplier, 
    selectedSize 
  };
}

// Real-time event listeners for size change and checkbox toggles
boxSizeSelect.addEventListener('change', calculatePrice);
categoryCheckboxes.forEach(cb => {
  cb.addEventListener('change', calculatePrice);
});

/**
 * Submits the order payload via fetch POST without custom headers or no-cors mode.
 */
async function submitOrder(event) {
  if (event) event.preventDefault();

  const calcResult = calculatePrice();
  if (!calcResult.valid) {
    alert('กรุณาเลือกหมวดสินค้าอย่างน้อย 1 หมวดก่อนทำการสั่งซื้อ');
    return;
  }

  const checkedCategories = Array.from(categoryCheckboxes)
    .filter(cb => cb.checked)
    .map(cb => cb.value);

  const payload = {
    size: calcResult.selectedSize,
    basePrice: BASE_PRICES[calcResult.selectedSize],
    categories: checkedCategories,
    averageMultiplier: calcResult.avgMultiplier,
    totalPrice: calcResult.price
  };

  // แทนที่ URL ด้านล่างด้วย URL จากขั้นที่ 2
  const url = "[วาง URL จากขั้นที่ 2]";

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const result = await response.json();
    alert('ส่งคำสั่งซื้อสำเร็จ!');
    console.log('Order success:', result);
  } catch (error) {
    console.error('Error submitting order:', error);
    alert('เกิดข้อผิดพลาดในการส่งคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง');
  }
}

// Attach event listener to form submission if #orderForm exists
if (orderForm) {
  orderForm.addEventListener('submit', submitOrder);
}

// Initial calculation on page load
calculatePrice();

