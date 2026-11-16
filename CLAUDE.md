# কাজের নিয়ম

## Commit
- Commit শুধু এই নামে ও ইমেইলে হবে: `msisaif <61042251+msisaif@users.noreply.github.com>`।
- Author ও committer দুটোই এই পরিচয়ে থাকবে।
- Commit মেসেজে কোনো attribution লাইন রাখা যাবে না, যেমন `Co-Authored-By`, `Claude-Session`, "Generated with Claude" বা কোনো মডেলের নাম।

## Push
- মালিক না বললে `git push` করা যাবে না।

## Stack
- সাইট [Alo](https://github.com/msilabs/alo) (`@msilabs/alo`) দিয়ে বানানো। কোনো `.alo` ফাইল বদলানোর আগে `AGENTS.md` পড়তে হবে।
- CSS `global/style.css`-এ, খেলার JS `global/app.js`-এ। JS-এ বানানো HTML-এ scoped `<style>` পৌঁছায় না, তাই CSS global-এই থাকবে।
- তৈরি করা কোড থাকে `data/samples/<ভাষা>.json`-এ। `pages/page.alo` সেগুলো লুকানো `<pre class="lib-src">` হিসেবে বসায়, `app.js` সেখান থেকে পড়ে।
- `node alo build` ভুল ছাড়া শেষ হতে হবে। `dist/` আর `.alo/` কখনো হাতে বদলানো যাবে না।
