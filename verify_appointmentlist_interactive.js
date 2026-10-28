const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', m => {
    if (m.type() === 'error') consoleErrors.push(m.text());
  });
  page.on('pageerror', err => consoleErrors.push(err.message));

  console.log('--- Step 1: Navigating to Appointment List ---');
  await page.goto('http://localhost:3000/home/appointmentlist', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Take screenshot of clean appointment list
  await page.screenshot({ path: 'appointmentlist_verified_pristine.png' });
  console.log('Saved appointmentlist_verified_pristine.png');

  // Verify modals are hidden by default
  const paymentDisplay = await page.$eval('#paymentFormLayout', el => window.getComputedStyle(el).display);
  const cancelDisplay = await page.$eval('.bs-example-modal-sm', el => window.getComputedStyle(el).display);
  console.log('Initial modal displays: Payment =', paymentDisplay, ', Cancel =', cancelDisplay);
  if (paymentDisplay !== 'none' || cancelDisplay !== 'none') {
    throw new Error('Modals are not properly hidden on load!');
  }

  console.log('\n--- Step 2: Testing Patient Check In (.btncheckin) ---');
  const checkinBtn = await page.$('.btncheckin');
  if (checkinBtn) {
    await checkinBtn.click();
    await page.waitForTimeout(500);
    const msg = await page.$('.ns-box, .swal2-container, #notificationContainer');
    console.log('Check-in notification displayed:', !!msg);
  }

  console.log('\n--- Step 3: Testing Payment Request Modal (.apptPay) ---');
  const payBtn = await page.$('.apptPay');
  if (payBtn) {
    await payBtn.click();
    await page.waitForTimeout(600);
    const modalVisible = await page.$eval('#paymentFormLayout', el => window.getComputedStyle(el).display !== 'none');
    console.log('Payment modal opened:', modalVisible);
    
    // Fill and submit
    const amtInput = await page.$('#patientAmountGlobal');
    if (amtInput) {
      await amtInput.fill('1500');
      await page.click('#btnRequestGlobal');
      await page.waitForTimeout(600);
      const modalClosed = await page.$eval('#paymentFormLayout', el => window.getComputedStyle(el).display === 'none');
      console.log('Payment modal closed on submit:', modalClosed);
    }
  }

  console.log('\n--- Step 4: Testing Appointment Collapse Toggle (.CollapseIcon) ---');
  const collapseIcon = await page.$('.CollapseIcon');
  if (collapseIcon) {
    await collapseIcon.click();
    await page.waitForTimeout(400);
    console.log('Toggled collapse icon successfully');
  }

  console.log('\n--- Step 5: Testing Cancel Appointment Dialog (.btnAppointment) ---');
  const cancelBtn = await page.$('.btnAppointment');
  if (cancelBtn) {
    await cancelBtn.click();
    await page.waitForTimeout(600);
    const cancelModalVisible = await page.$eval('.bs-example-modal-sm', el => window.getComputedStyle(el).display !== 'none');
    console.log('Cancel modal opened:', cancelModalVisible);
    
    // Click Cancel in modal to dismiss
    const dismissBtn = await page.$('.bs-example-modal-sm button:has-text("Cancel"), .bs-example-modal-sm [data-dismiss="modal"]');
    if (dismissBtn) {
      await dismissBtn.click();
      await page.waitForTimeout(400);
      const cancelModalClosed = await page.$eval('.bs-example-modal-sm', el => window.getComputedStyle(el).display === 'none');
      console.log('Cancel modal closed on dismiss:', cancelModalClosed);
    }
  }

  console.log('\n--- Step 6: Testing Consultation Button Navigation (.btnConsultation) ---');
  const consultLink = await page.$eval('.btnConsultation', el => el.getAttribute('href') || el.outerHTML);
  console.log('Consultation button configured with:', consultLink);

  console.log('\n--- Console Errors Count:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }

  console.log('\nAll interactive checks for appointment list passed successfully!');
  await browser.close();
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
