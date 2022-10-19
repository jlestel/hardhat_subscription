import { CCard, CCardBody, CCardText, CCardTitle, CCol, CRow } from '@coreui/react';
import React from "react";
import { atomOneDark, CopyBlock } from "react-code-blocks";

export function Api({ }) {

  return (
    <>
    <CRow>
      <h2>Start now to accept crypto payments!</h2>
      <h4>By direct link or Javascript integration on your Website</h4>

      <CCol m>
        <CCard>
          <CCardBody>
            <CCardTitle>With our JavaScript API</CCardTitle>
            <CCardText>
              <p>Include Payperblock.js and trigger API methods. <a href="/payperblock_sample.html" target="_blank">Check this sample</a> to start:</p>
              <CopyBlock
                language="html"
                text={`<script src="https://payperblock.citio.digital/payperblock.js" />
<script type="text/javacript>
payperblock.subscribe({
  subscriptionPlan: "0"
})
.then((txHash) => {
  console.log(txHash);
  // do something after the subscription
});
</script> `}
                wrapLines={true}
                showLineNumbers={false}
                theme={atomOneDark}
                codeBlock
              />
            </CCardText>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol m>
        <CCard>
          <CCardBody>
            <CCardTitle>Or by Link integration</CCardTitle>
            <CCardText>
              Don&apos;t have the resources to integrate our API into your system? <br /><br/>
              - Use our link integration where you can redirect your customer to our payment page. <br /><br />
              Just use this URL: <a href="/#/mini/0" target="_blank">https://payperblock.citio.digital/#/mini/0</a> and check <a href="#">this documention</a> to customize your plan(s) link !<br/>
              Yes, you can even bundle multiple plans in one link.<br /><br/>
              You can also print QR code that refers to this URL and share it anywhere.<br /><br />
              After the payment, we can redirect your customer back to you.<br /><br />
            </CCardText>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
    <br/>
      <h4>... and integrate seamlessly Payperblock into your business stack:</h4>
      <CRow>
      <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Receipts and reminders</CCardTitle>
              <CCardText>
              Spend less time tracking down payments and more time growing your business.<br/>
              We send reminders, and payment retries - so you don’t have to.
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Front / API</CCardTitle>
              <CCardText>
              You can share our default payment page to your customers.<br/>
              Or integrate payment via our Javascript API with a few lines of code.
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard>
            <CCardBody>
              <CCardTitle>Webhooks</CCardTitle>
              <CCardText>
              You can use Webhooks to make integration seamless. <br/>
              Save hours of manual reconciliation work by connecting with systems you already use.
              </CCardText>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
    
  );
}

export default Api