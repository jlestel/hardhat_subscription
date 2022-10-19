import { CCard, CCardBody, CCardText, CCardTitle, CCol, CRow } from '@coreui/react';
import React from "react";
import { atomOneDark, CopyBlock } from "react-code-blocks";

export function Api({ }) {

  return (
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
  );
}

export default Api