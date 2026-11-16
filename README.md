# চিহ্ন টাইপিং

PHP, JavaScript, TypeScript, Python, Java, C, C++, C#, Go, Rust, Kotlin, Swift, Dart ও SQL-এর আসল কোড টাইপ করার খেলা।
গতি, নির্ভুলতা এবং কোন চিহ্নে বেশি ভুল হয় তার হিসাব রাখে। নিজের কোড যোগ করা যায়।

🔗 **লাইভ:** https://msilabs.github.io/code-typing-practice/

সাইট বানানো হয় [আলো (Alo)](https://github.com/msilabs/alo) দিয়ে। Node.js ২২ বা নতুন ভার্সন লাগবে।

## চালানো

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # dist/ ফোল্ডারে সাইট
```

GitHub Pages-এর মতো সাব-পাথের জন্য: `node alo build --base /code-typing-practice/`

## ফাইল কোথায়

```
pages/page.alo        পেজের HTML
global/style.css      সব CSS
global/app.js         খেলার JS
data/samples/*.json   প্রতিটা ভাষার তৈরি করা কোড (ভাষা প্রতি ১০টা)
```

নতুন নমুনা কোড যোগ করতে ভাষার JSON ফাইলের `files`-এ `{ "file": "নাম", "text": "কোড" }` বসান।
