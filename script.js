/**
 * ==========================================
 * HTML Element IDs and Selectors Reference:
 * ==========================================
 * - input[name="boxSize"]: <input type="radio"> elements for choosing box size ('S', 'M', 'L')
 * - .cat-checkbox        : Class for category checkboxes (Values: 'rope', 'bead', 'silver', 'gold')
 * - #totalPrice          : Element to display the real-time calculated price
 * - #orderForm           : <form> element containing inputs and submit button
 * - #submitBtn           : <button> element for form submission (dynamically disabled if 0 categories selected)
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
const boxSizeRadios = document.querySelectorAll('input[name="boxSize"]');
const categoryCheckboxes = document.querySelectorAll('.cat-checkbox');
const totalPriceDisplay = document.getElementById('totalPrice');
const orderForm = document.getElementById('orderForm');
const submitBtn = document.getElementById('submitBtn');

/**
 * Calculates the price in real-time based on selected radio size and checked categories.
 * Formula: Average Multiplier = Sum of multipliers / Number of selected categories
 * Final Price = Base Price * Average Multiplier
 */
function calculatePrice() {
  let selectedSize = 'S';
  boxSizeRadios.forEach(r => {
    if (r.checked) selectedSize = r.value;
  });
  
  const basePrice = BASE_PRICES[selectedSize] || 0;
  const checkedCategories = Array.from(categoryCheckboxes).filter(cb => cb.checked);

  // Validation: Must select at least one category
  if (checkedCategories.length === 0) {
    totalPriceDisplay.textContent = 'กรุณาเลือกหมวดสินค้าอย่างน้อย 1 หมวด';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.5';
      submitBtn.style.cursor = 'not-allowed';
    }
    return { valid: false, price: 0 };
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.style.cursor = 'pointer';
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
    selectedSize,
    categories: checkedCategories.map(cb => cb.value)
  };
}

// Real-time event listeners for size radio changes and category checkbox toggles
boxSizeRadios.forEach(r => {
  r.addEventListener('change', calculatePrice);
});

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

  const payload = {
    size: calcResult.selectedSize,
    basePrice: BASE_PRICES[calcResult.selectedSize],
    categories: calcResult.categories,
    averageMultiplier: calcResult.avgMultiplier,
    totalPrice: calcResult.price
  };

  const url = "https://script.google.com/macros/s/AKfycbw2DW-j41igcer-VjGxed8RWGEfpc7TCoXLxbG5JZievMYExmWQ_WwxPIzxmUIRWoZ6/exec";

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
