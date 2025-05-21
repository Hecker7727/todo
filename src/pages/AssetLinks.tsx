import React from "react";

const assetlinks = [
  {
    relation: ["delegate_permission/common.handle_all_urls"],
    target: {
      namespace: "android_app",
      package_name: "dev.pages.sc_todo.twa",
      sha256_cert_fingerprints: [
        "4D:40:25:8F:4C:1D:4C:84:36:28:EB:75:B4:75:BE:08:C6:40:DA:EE:3A:DB:48:21:E5:E9:5F:50:E0:20:25:52"
      ]
    }
  }
];

export default function AssetLinksPage() {
  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 24, background: "#181a20", color: "#fff", borderRadius: 16 }}>
      <h2>.well-known/assetlinks.json</h2>
      <pre style={{ background: "#23272f", color: "#fff", padding: 16, borderRadius: 8, overflowX: "auto" }}>
        {JSON.stringify(assetlinks, null, 2)}
      </pre>
      <p style={{ marginTop: 24, color: "#aaa" }}>
        This is a display page for your <code>assetlinks.json</code> file. For Android verification, this file must be accessible at <code>/.well-known/assetlinks.json</code>.
      </p>
    </div>
  );
}
