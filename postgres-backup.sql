--
-- PostgreSQL database cluster dump
--

\restrict NnyjLnSReYucrTVH9M66GcQz5w8yZsEngNCHgjifZKIECoBGOEeUPWa6PQx6rke

SET default_transaction_read_only = off;

SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;

--
-- Roles
--

CREATE ROLE admin;
ALTER ROLE admin WITH SUPERUSER INHERIT CREATEROLE CREATEDB LOGIN REPLICATION BYPASSRLS PASSWORD 'SCRAM-SHA-256$4096:jDGQVpvk0ES5wqNkPa4sRA==$lw2KwpS1kipnszQCIFDxmef0QZzzeDkL1cxlrglxK0A=:tvuC3Ag6amqik9HL4W0ugp5ALQXRra1kIgMdc4KCqL8=';

--
-- User Configurations
--








\unrestrict NnyjLnSReYucrTVH9M66GcQz5w8yZsEngNCHgjifZKIECoBGOEeUPWa6PQx6rke

--
-- Databases
--

--
-- Database "template1" dump
--

\connect template1

--
-- PostgreSQL database dump
--

\restrict equqCztE30LpdhjkEfPxpePV3wCGHXTLwztUbKcaEQwzFhgUMpjhuGqIsJhukYx

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict equqCztE30LpdhjkEfPxpePV3wCGHXTLwztUbKcaEQwzFhgUMpjhuGqIsJhukYx

--
-- Database "assistant_db" dump
--

--
-- PostgreSQL database dump
--

\restrict 2avfJWChYdScsbcKhIi1pNP5d16u5yk8Rz47wTv5gtETAm5K7F9fHogBHevGEqp

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: assistant_db; Type: DATABASE; Schema: -; Owner: admin
--

CREATE DATABASE assistant_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE assistant_db OWNER TO admin;

\unrestrict 2avfJWChYdScsbcKhIi1pNP5d16u5yk8Rz47wTv5gtETAm5K7F9fHogBHevGEqp
\connect assistant_db
\restrict 2avfJWChYdScsbcKhIi1pNP5d16u5yk8Rz47wTv5gtETAm5K7F9fHogBHevGEqp

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO admin;

--
-- Name: conversations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.conversations (
    id uuid NOT NULL,
    user_id character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL
);


ALTER TABLE public.conversations OWNER TO admin;

--
-- Name: messages; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.messages (
    id uuid NOT NULL,
    conversation_id uuid NOT NULL,
    role character varying(50) NOT NULL,
    content json NOT NULL,
    created_at timestamp with time zone NOT NULL
);


ALTER TABLE public.messages OWNER TO admin;

--
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.alembic_version (version_num) FROM stdin;
055a80d1cadd
\.


--
-- Data for Name: conversations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.conversations (id, user_id, title, created_at, updated_at) FROM stdin;
deed8e3b-e286-4ce9-8e32-dbde71796da7	dev_user_alice	Running Shoes	2026-07-28 12:35:10.869286+00	2026-07-28 13:34:03.010633+00
3b757397-479b-4b5e-b00f-33fe4307de28	dev_user_123	New Conversation	2026-07-28 15:42:54.535224+00	2026-07-28 15:43:00.763468+00
191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	user_3D6fs6SmzCKV0AjuqPlobQ5eDso	New Conversation	2026-07-28 15:24:51.562344+00	2026-07-28 16:50:38.795313+00
216b565e-7ef6-49ad-b2f3-4a35ab0c53f9	user_3D6fs6SmzCKV0AjuqPlobQ5eDso	Help me find the right product	2026-07-28 17:23:48.338123+00	2026-07-28 17:27:17.070895+00
8572805b-6b27-43c1-b6fa-678c92f776a4	user_3Gceen629uITufBzqdHAkPQsI3M	Can you explain specifications for me?	2026-07-29 00:08:20.138477+00	2026-07-29 00:08:23.677951+00
2b093027-d9f3-4526-9ff5-cb1ff9daa06b	user_3Gceen629uITufBzqdHAkPQsI3M	New Conversation	2026-07-29 00:21:43.492257+00	2026-07-29 00:21:53.559119+00
1671e58a-227a-4ab4-99d7-3b0c055b4cad	user_3Gceen629uITufBzqdHAkPQsI3M	New Conversation	2026-07-29 00:22:42.701054+00	2026-07-29 00:23:05.051806+00
1e68ee36-c371-4ee8-9ffa-90067437fbc1	user_3D6fs6SmzCKV0AjuqPlobQ5eDso	hi	2026-08-03 07:45:11.545894+00	2026-08-03 07:45:35.103385+00
97a9d04d-b9a8-4926-b338-8aa5194d4cf1	user_3D6fs6SmzCKV0AjuqPlobQ5eDso	Help me shop within my budget	2026-08-03 07:46:02.83331+00	2026-08-03 08:11:12.111105+00
22b63e9a-4c6c-4f7a-bb73-f086fab31373	user_3Gd89w2nWpCdmk1YLHqeUQG8sEz	hi	2026-08-08 09:53:49.957537+00	2026-08-08 09:54:26.940033+00
\.


--
-- Data for Name: messages; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public.messages (id, conversation_id, role, content, created_at) FROM stdin;
f928d4cb-66ae-44ae-b3c6-7da90f5f05cf	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 12:39:54.901409+00
c474a883-47ac-4858-acf8-83d6962d16e6	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "I encountered an API error while processing your shopping request: Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.", "type": "text"}]	2026-07-28 12:39:55.834414+00
1d430d68-b466-4c8b-b4cb-f4aaf4e7360c	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 12:42:06.252338+00
42c8421f-7696-4bd7-b1a2-cb0bad41602d	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "I encountered an API error while processing your shopping request: Request had invalid authentication credentials. Expected OAuth 2 access token, login cookie or other valid authentication credential. See https://developers.google.com/identity/sign-in/web/devconsole-project.", "type": "text"}]	2026-07-28 12:42:06.802462+00
ff66c878-4b1f-4808-9f98-7fb17a794231	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 12:42:42.86054+00
b6fdfae1-06e8-43b0-86a6-1ca73bfaab98	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "I encountered an API error while processing your shopping request: This model models/gemini-2.5-flash is no longer available to new users. Please update your code to use a newer model for the latest features and improvements.", "type": "text"}]	2026-07-28 12:42:44.155404+00
a27e3980-de80-4f7b-8480-c5bf092a6ec9	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 12:54:33.755274+00
81b72f52-09f1-4386-8ea3-7991720d9869	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "```json\\n{\\n  \\"name\\": \\"search_products\\",\\n  \\"arguments\\": {\\n    \\"query\\": \\"running shoes\\"\\n  }\\n}\\n```", "type": "text"}]	2026-07-28 12:54:52.609718+00
6c49d4c2-4569-4bb1-8a19-165186852afe	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 13:12:01.791817+00
a8a779de-2b53-4a16-9bf9-c8fb1f089e4e	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "```json\\n{\\n  \\"name\\": \\"search_products\\",\\n  \\"arguments\\": {\\n    \\"query\\": \\"shoes\\"\\n  }\\n}\\n```", "type": "text"}]	2026-07-28 13:12:06.209442+00
8d70e30d-55c2-43d4-a99a-77ef4ff9124d	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Compare product A and product B.", "type": "text"}]	2026-07-28 13:12:38.879068+00
4cd86541-c373-4be1-8703-d7d1c12387a7	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "It looks like \\"Product A\\" and \\"Product B\\" might be placeholders! Could you please let me know the specific products, brands, or shoe models you'd like to compare? \\n\\nIf you are looking for running shoes under $150, please mention any specific models (for example: *Nike Pegasus*, *Brooks Ghost*, *Asics Gel-Nimbus*, *Hoka Clifton*, etc.), and I'd be happy to break down their features, cushioning, weight, and pricing for you!", "type": "text"}]	2026-07-28 13:12:48.480451+00
bca61b79-cd7a-4bba-95cd-0b1bd960e65d	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 13:21:14.238075+00
0c878eae-a2ee-47bc-b06c-9af879914ffa	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "I encountered an API error while processing your shopping request: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \\n* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.6-flash\\nPlease retry in 43.479835538s.", "type": "text"}]	2026-07-28 13:21:14.706389+00
d9a5041c-25c1-4deb-bfcd-5afac816b858	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 13:23:43.689877+00
f0d6c75a-3e51-4cac-ae71-3a78256f7d60	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "I encountered an API error while processing your shopping request: You exceeded your current quota, please check your plan and billing details. For more information on this error, head to: https://ai.google.dev/gemini-api/docs/rate-limits. To monitor your current usage, head to: https://ai.dev/rate-limit. \\n* Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20, model: gemini-3.6-flash\\nPlease retry in 11.632105848s.", "type": "text"}]	2026-07-28 13:23:46.496684+00
f98af22f-3c5a-49f2-84be-36e3aa180af0	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 13:24:30.681978+00
9a6b2d02-b215-426e-a93a-87a1dee8a94f	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "I encountered an API error while processing your shopping request: This model is currently experiencing high demand. Spikes in demand are usually temporary. Please try again later.", "type": "text"}]	2026-07-28 13:24:32.289202+00
18b5b948-23de-4655-a82a-836fb56aff47	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 13:25:18.290769+00
2757138f-b0c1-4db7-803f-d40dd35c65d9	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "I apologize, but it seems I am currently unable to retrieve specific product information from our catalog. \\n\\nWhile I troubleshoot this, could you please tell me if you have a preferred brand or a specific type of running (e.g., road running, trail running, or long-distance) you are interested in? This will help me provide you with the best recommendations once our product search is fully operational!", "type": "text"}]	2026-07-28 13:25:21.78165+00
00c49d8b-be51-4d14-977e-50d272d9b5d3	deed8e3b-e286-4ce9-8e32-dbde71796da7	user	[{"text": "Recommend running shoes under $150.", "type": "text"}]	2026-07-28 13:34:00.696378+00
7a6939fe-fb7d-460f-b39f-5684f22b99f3	deed8e3b-e286-4ce9-8e32-dbde71796da7	assistant	[{"text": "Here is a great option for running shoes under $150 currently in our catalog:\\n\\n### **Nike Ultraboost Pulse**\\n*   **Price:** $69.00\\n*   **Description:** Performance running shoes built for responsive cushioning and energy return. These offer a lightweight construction and excellent support for both running and everyday wear.\\n*   **Features:** Breathable upper to keep your feet cool and a flexible sole for a smooth, comfortable stride.\\n*   **Available Sizes:** 40, 42, 43\\n*   **Colors:** Gray, Pink\\n\\nWould you like more details on this pair, or would you like me to look for other options?", "type": "text"}, {"type": "product_recommendations", "products": [{"id": 28, "name": "Nike Ultraboost Pulse ", "price": 69, "sizes": ["40", "42", "43"], "colors": ["gray", "pink"], "images": {"gray": "/products/7g.png", "pink": "/products/7p.png"}, "createdAt": "2026-07-11T10:54:44.163Z", "updatedAt": "2026-07-11T10:54:44.163Z", "description": "The Nike Ultraboost Pulse offers lightweight construction, cushioned support, and excellent responsiveness for both running and everyday wear. Its breathable upper keeps your feet cool while the flexible sole provides a smooth and comfortable stride.", "categorySlug": "shoes", "shortDescription": "Performance running shoes built for responsive cushioning and energy return."}]}]	2026-07-28 13:34:02.978624+00
2982005f-3155-4d9f-bfdd-b5e6e6910ff8	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	user	[{"text": "i want to buy a tshirt", "type": "text"}]	2026-07-28 15:25:43.770723+00
ab6d4aff-081a-42ef-bee6-c38ec5b3109f	216b565e-7ef6-49ad-b2f3-4a35ab0c53f9	assistant	[{"text": "I would be happy to help you find the perfect product! To get started and provide the best recommendations, could you tell me a little bit more about what you are looking for?\\n\\nFor example:\\n* **What type of item do you need?** (e.g., electronics, home appliances, apparel, etc.)\\n* **Do you have a specific budget in mind?**\\n* **Are there any must-have features or brands you prefer?**\\n* **What will you primarily be using the product for?**\\n\\nOnce I have a better idea of your needs, I can search our catalog and help you compare your best options!", "type": "text"}]	2026-07-28 17:23:51.545928+00
05f60fff-f1ac-4881-b02d-efcae1da2bdf	216b565e-7ef6-49ad-b2f3-4a35ab0c53f9	user	[{"text": "i want to buy a shoe below 60 dollers", "type": "text"}]	2026-07-28 17:24:29.806562+00
b5bc83e8-3395-4e73-8253-32e9be82a795	216b565e-7ef6-49ad-b2f3-4a35ab0c53f9	assistant	[{"text": "I have found a great option that fits your budget perfectly! Here is a high-quality t-shirt currently available for around $30:\\n\\n<product-card>\\n  **Nike Dri Flex T-Shirt**\\n  - **Price:** $29\\n  - **Description:** A breathable sports t-shirt engineered to keep you dry and comfortable.\\n  - **Features:** Moisture-wicking technology to draw sweat away from the skin, lightweight construction, and flexible fabric for natural movement.\\n  - **Available Colors:** White, Pink\\n  - **Available Sizes:** S, M, L\\n</product-card>\\n\\nI also found the **Adidas CoreFit T-Shirt** ($39), which is slightly above your budget but offers excellent performance for workouts and daily wear.\\n\\nWould you like more details on either of these, or should I look for other options?", "type": "text"}, {"type": "product_recommendations", "products": [{"id": 29, "name": "Levi’s Classic Denim", "price": 59, "sizes": ["s", "m", "l"], "colors": ["blue", "green"], "images": {"blue": "/products/8b.png", "green": "/products/8gr.png"}, "createdAt": "2026-07-11T10:54:51.508Z", "updatedAt": "2026-07-11T10:54:51.508Z", "description": "The Levi's Classic Denim jacket is made from durable premium denim with a comfortable fit that complements any casual wardrobe. Designed for year-round wear, it pairs effortlessly with jeans, chinos, or joggers, making it a reliable choice for everyday fashion.", "categorySlug": "t-shirt", "shortDescription": "A timeless denim jacket offering durability and versatile everyday style."}, {"id": 26, "name": "Under Armour StormFleece", "price": 49, "sizes": ["s", "m", "l"], "colors": ["red", "orange", "black"], "images": {"red": "/products/5r.png", "black": "/products/5bl.png", "orange": "/products/5o.png"}, "createdAt": "2026-07-11T10:52:43.256Z", "updatedAt": "2026-07-11T10:52:43.256Z", "description": "The Under Armour StormFleece delivers superior warmth with a soft interior and weather-resistant exterior. It provides excellent comfort without adding unnecessary weight, making it suitable for outdoor adventures, workouts, and casual daily wear.", "categorySlug": "t-shirt", "shortDescription": "A warm fleece sweatshirt designed for comfort in cold weather conditions."}, {"id": 25, "name": "Nike Dri Flex T-Shirt", "price": 29, "sizes": ["s", "m", "l"], "colors": ["white", "pink"], "images": {"pink": "/products/4p.png", "white": "/products/4w.png"}, "createdAt": "2026-07-11T10:52:35.603Z", "updatedAt": "2026-07-11T10:52:35.603Z", "description": "The Nike Dri Flex T-Shirt uses moisture-wicking technology to quickly draw sweat away from your skin, helping you stay cool during intense workouts. Its lightweight construction and flexible fabric allow natural movement, making it a dependable choice for training and everyday activities.", "categorySlug": "t-shirt", "shortDescription": "A breathable sports t-shirt engineered to keep you dry and comfortable."}, {"id": 24, "name": "Nike Air Essentials Pullover", "price": 69, "sizes": ["s", "m", "l"], "colors": ["green", "blue", "black"], "images": {"blue": "/products/3b.png", "black": "/products/3bl.png", "green": "/products/3gr.png"}, "createdAt": "2026-07-11T10:52:27.110Z", "updatedAt": "2026-07-11T10:52:27.110Z", "description": "The Nike Air Essentials Pullover features soft brushed fabric that provides excellent insulation while remaining lightweight. Its relaxed design makes it suitable for workouts, travel, or casual everyday wear, delivering both performance and timeless style.", "categorySlug": "t-shirt", "shortDescription": "A premium pullover offering warmth, comfort, and a modern athletic look."}, {"id": 23, "name": "Puma Ultra Warm Zip", "price": 59, "sizes": ["s", "m", "l", "xl"], "colors": ["gray", "green"], "images": {"gray": "/products/2g.png", "green": "/products/2gr.png"}, "createdAt": "2026-07-11T10:52:16.557Z", "updatedAt": "2026-07-11T10:52:16.557Z", "description": "The Puma Ultra Warm Zip combines a soft fleece interior with a durable outer layer for reliable warmth and comfort. Featuring a full-length zipper and relaxed fit, it is ideal for outdoor activities, commuting, or layering during chilly days without sacrificing style.", "categorySlug": "t-shirt", "shortDescription": "A comfortable zip-up sweatshirt built to provide warmth in cooler weather."}, {"id": 22, "name": "Adidas CoreFit T-Shirt", "price": 39, "sizes": ["s", "m", "l", "xl", "xxl"], "colors": ["gray", "purple", "green"], "images": {"gray": "/products/1g.png", "green": "/products/1gr.png", "purple": "/products/1p.png"}, "createdAt": "2026-07-11T10:48:25.660Z", "updatedAt": "2026-07-11T10:48:25.660Z", "description": "The Adidas CoreFit T-Shirt is crafted from breathable, moisture-wicking fabric to keep you cool during workouts and casual wear. Its athletic fit provides unrestricted movement while the soft material ensures lasting comfort throughout the day. Perfect for training sessions, running, or everyday styling.", "categorySlug": "t-shirt", "shortDescription": "A lightweight performance t-shirt designed for all-day comfort and active movement."}]}]	2026-07-28 17:27:17.008908+00
26b3d211-11a2-48ae-8b26-0cef4924e13b	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	assistant	[{"text": "I'd be happy to help you find a great t-shirt! Based on our current collection, here are a couple of excellent options:\\n\\n### Product Recommendations\\n\\n*   **Under Armour StormFleece**\\n    *   **Price:** $49\\n    *   **Description:** A warm fleece sweatshirt designed for comfort in cold weather conditions. Features a soft interior and a weather-resistant exterior.\\n    *   **Available Colors:** Red, Orange, Black\\n    *   **Sizes:** S, M, L\\n\\n*   **Puma Ultra Warm Zip**\\n    *   **Price:** $59\\n    *   **Description:** A comfortable zip-up sweatshirt built to provide warmth in cooler weather with a full-length zipper and a relaxed fit.\\n    *   **Available Colors:** Gray, Green\\n    *   **Sizes:** S, M, L, XL\\n\\nTo help me narrow down the best choice for you, could you let me know:\\n1. Are you looking for something for athletic wear or casual daily wear?\\n2. Do you have a specific color or size preference?\\n3. Is there a specific budget you are aiming for?", "type": "text"}, {"type": "product_recommendations", "products": [{"id": 26, "name": "Under Armour StormFleece", "price": 49, "sizes": ["s", "m", "l"], "colors": ["red", "orange", "black"], "images": {"red": "/products/5r.png", "black": "/products/5bl.png", "orange": "/products/5o.png"}, "createdAt": "2026-07-11T10:52:43.256Z", "updatedAt": "2026-07-11T10:52:43.256Z", "description": "The Under Armour StormFleece delivers superior warmth with a soft interior and weather-resistant exterior. It provides excellent comfort without adding unnecessary weight, making it suitable for outdoor adventures, workouts, and casual daily wear.", "categorySlug": "t-shirt", "shortDescription": "A warm fleece sweatshirt designed for comfort in cold weather conditions."}, {"id": 23, "name": "Puma Ultra Warm Zip", "price": 59, "sizes": ["s", "m", "l", "xl"], "colors": ["gray", "green"], "images": {"gray": "/products/2g.png", "green": "/products/2gr.png"}, "createdAt": "2026-07-11T10:52:16.557Z", "updatedAt": "2026-07-11T10:52:16.557Z", "description": "The Puma Ultra Warm Zip combines a soft fleece interior with a durable outer layer for reliable warmth and comfort. Featuring a full-length zipper and relaxed fit, it is ideal for outdoor activities, commuting, or layering during chilly days without sacrificing style.", "categorySlug": "t-shirt", "shortDescription": "A comfortable zip-up sweatshirt built to provide warmth in cooler weather."}]}]	2026-07-28 15:25:46.835962+00
f3313b5d-ccb1-4376-8ad7-c9ccdfa7b86c	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	user	[{"text": "i want to buy shoes", "type": "text"}]	2026-07-28 15:26:36.593647+00
ef60709d-de14-47bb-8f67-73033a7083c7	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	assistant	[{"text": "I can certainly help you find the right pair of shoes! We have some great options ranging from performance running gear to comfortable lifestyle sneakers.\\n\\n### Product Recommendations\\n\\n*   **Adidas EQT Advance**\\n    *   **Price:** $79\\n    *   **Description:** A lightweight lifestyle sneaker that blends sporty performance with modern street style. Perfect for everyday wear or light training.\\n    *   **Available Colors:** Black\\n    *   **Sizes:** 37, 40, 41, 42, 44, 46, 48\\n\\n*   **Nike Ultraboost Pulse**\\n    *   **Price:** $69\\n    *   **Description:** Performance running shoes built with responsive cushioning and energy return to keep you comfortable on the move.\\n    *   **Available Colors:** Gray, Pink\\n    *   **Sizes:** 40, 42, 43\\n\\n*   **Nike Air Max 270**\\n    *   **Price:** $59\\n    *   **Description:** Stylish sneakers featuring signature Air Max cushioning for exceptional all-day comfort.\\n    *   **Available Colors:** Gray, White\\n    *   **Sizes:** 40, 42, 43, 44\\n\\nTo help you narrow down your search, could you tell me:\\n1. Are you looking for athletic/running shoes or something more casual for daily wear?\\n2. Do you have a specific size or color preference?\\n3. Are there any specific features (like extra cushioning or breathability) that are important to you?", "type": "text"}, {"type": "product_recommendations", "products": [{"id": 30, "name": "Adidas EQT Advance", "price": 79, "sizes": ["48", "44", "46", "41", "40", "42", "37"], "colors": ["black"], "images": {"black": "https://res.cloudinary.com/zobugm28/image/upload/v1784215092/shlwqmks7lgrwdqnjkny.jpg"}, "createdAt": "2026-07-16T15:19:26.520Z", "updatedAt": "2026-07-16T15:19:26.520Z", "description": "The Adidas EQT Advance features a breathable knit upper, lightweight cushioning, and a supportive fit for all-day comfort. Inspired by the classic Equipment series, it blends sporty performance with contemporary street style, making it ideal for everyday wear, casual outings, and light training sessions.", "categorySlug": "shoes", "shortDescription": "A lightweight lifestyle sneaker that gives modern comfort."}, {"id": 28, "name": "Nike Ultraboost Pulse ", "price": 69, "sizes": ["40", "42", "43"], "colors": ["gray", "pink"], "images": {"gray": "/products/7g.png", "pink": "/products/7p.png"}, "createdAt": "2026-07-11T10:54:44.163Z", "updatedAt": "2026-07-11T10:54:44.163Z", "description": "The Nike Ultraboost Pulse offers lightweight construction, cushioned support, and excellent responsiveness for both running and everyday wear. Its breathable upper keeps your feet cool while the flexible sole provides a smooth and comfortable stride.", "categorySlug": "shoes", "shortDescription": "Performance running shoes built for responsive cushioning and energy return."}, {"id": 27, "name": "Nike Air Max 270", "price": 59, "sizes": ["40", "42", "43", "44"], "colors": ["gray", "white"], "images": {"gray": "/products/6g.png", "white": "/products/6w.png"}, "createdAt": "2026-07-11T10:52:54.671Z", "updatedAt": "2026-07-11T10:52:54.671Z", "description": "The Nike Air Max 270 combines a breathable upper with the signature Air Max cushioning to provide exceptional comfort throughout the day. Whether you're walking around the city or wearing them casually, these sneakers deliver excellent support, durability, and modern style.", "categorySlug": "shoes", "shortDescription": "Stylish sneakers featuring responsive cushioning for everyday comfort."}]}]	2026-07-28 15:26:40.273673+00
54753f2b-3fd3-4dcd-9ff4-3995e3fc5d9b	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	user	[{"text": "i like nike", "type": "text"}]	2026-07-28 15:26:49.520616+00
a8e6e46f-aa18-4b73-a685-3b8b0fcaec42	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	assistant	[{"text": "That's a great choice! Nike is well-known for both their performance technology and iconic designs. \\n\\nCurrently, we have two excellent Nike models available in our collection:\\n\\n### Product Recommendations\\n\\n*   **Nike Ultraboost Pulse**\\n    *   **Price:** $69\\n    *   **Description:** Performance running shoes built with responsive cushioning and energy return to keep you comfortable on the move.\\n    *   **Available Colors:** Gray, Pink\\n    *   **Sizes:** 40, 42, 43\\n\\n*   **Nike Air Max 270**\\n    *   **Price:** $59\\n    *   **Description:** Stylish sneakers featuring signature Air Max cushioning for exceptional all-day comfort.\\n    *   **Available Colors:** Gray, White\\n    *   **Sizes:** 40, 42, 43, 44\\n\\n**Would you like me to help you compare these two, or are you looking for a specific size?** I can help you decide which one might fit your needs better based on whether you plan on using them for intense exercise or just casual daily walking!", "type": "text"}]	2026-07-28 15:26:52.142496+00
7707d0a8-a9f0-401b-bd64-bcf65947c9e5	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	user	[{"text": "i want to buy shoes", "type": "text"}]	2026-07-28 15:27:18.046686+00
1f123bd8-30e5-4f6b-a656-64bfe26f9018	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	assistant	[{"text": "It looks like you are interested in our shoe collection again! Since you previously mentioned you like Nike, I have highlighted those for you below, along with our other available option.\\n\\n### Product Recommendations\\n\\n*   **Nike Ultraboost Pulse**\\n    *   **Price:** $69\\n    *   **Description:** Performance running shoes built with responsive cushioning and energy return to keep you comfortable on the move.\\n    *   **Available Colors:** Gray, Pink\\n    *   **Sizes:** 40, 42, 43\\n\\n*   **Nike Air Max 270**\\n    *   **Price:** $59\\n    *   **Description:** Stylish sneakers featuring signature Air Max cushioning for exceptional all-day comfort.\\n    *   **Available Colors:** Gray, White\\n    *   **Sizes:** 40, 42, 43, 44\\n\\n*   **Adidas EQT Advance**\\n    *   **Price:** $79\\n    *   **Description:** A lightweight lifestyle sneaker that blends sporty performance with modern street style. Perfect for everyday wear or light training.\\n    *   **Available Colors:** Black\\n    *   **Sizes:** 37, 40, 41, 42, 44, 46, 48\\n\\nWould you like to know more about the fit or specific features of any of these, or perhaps narrow it down by your size?", "type": "text"}, {"type": "product_recommendations", "products": [{"id": 30, "name": "Adidas EQT Advance", "price": 79, "sizes": ["48", "44", "46", "41", "40", "42", "37"], "colors": ["black"], "images": {"black": "https://res.cloudinary.com/zobugm28/image/upload/v1784215092/shlwqmks7lgrwdqnjkny.jpg"}, "createdAt": "2026-07-16T15:19:26.520Z", "updatedAt": "2026-07-16T15:19:26.520Z", "description": "The Adidas EQT Advance features a breathable knit upper, lightweight cushioning, and a supportive fit for all-day comfort. Inspired by the classic Equipment series, it blends sporty performance with contemporary street style, making it ideal for everyday wear, casual outings, and light training sessions.", "categorySlug": "shoes", "shortDescription": "A lightweight lifestyle sneaker that gives modern comfort."}, {"id": 28, "name": "Nike Ultraboost Pulse ", "price": 69, "sizes": ["40", "42", "43"], "colors": ["gray", "pink"], "images": {"gray": "/products/7g.png", "pink": "/products/7p.png"}, "createdAt": "2026-07-11T10:54:44.163Z", "updatedAt": "2026-07-11T10:54:44.163Z", "description": "The Nike Ultraboost Pulse offers lightweight construction, cushioned support, and excellent responsiveness for both running and everyday wear. Its breathable upper keeps your feet cool while the flexible sole provides a smooth and comfortable stride.", "categorySlug": "shoes", "shortDescription": "Performance running shoes built for responsive cushioning and energy return."}, {"id": 27, "name": "Nike Air Max 270", "price": 59, "sizes": ["40", "42", "43", "44"], "colors": ["gray", "white"], "images": {"gray": "/products/6g.png", "white": "/products/6w.png"}, "createdAt": "2026-07-11T10:52:54.671Z", "updatedAt": "2026-07-11T10:52:54.671Z", "description": "The Nike Air Max 270 combines a breathable upper with the signature Air Max cushioning to provide exceptional comfort throughout the day. Whether you're walking around the city or wearing them casually, these sneakers deliver excellent support, durability, and modern style.", "categorySlug": "shoes", "shortDescription": "Stylish sneakers featuring responsive cushioning for everyday comfort."}]}]	2026-07-28 15:27:21.025618+00
06f703a7-302e-4b03-9e77-44ca4033eaf9	3b757397-479b-4b5e-b00f-33fe4307de28	user	[{"text": "hi", "type": "text"}]	2026-07-28 15:42:57.977397+00
131f1496-4a4b-4ca4-be11-8d50567da7e8	3b757397-479b-4b5e-b00f-33fe4307de28	assistant	[{"text": "Hello! I am your Ominify AI Shopping Assistant. I'm here to help you find exactly what you're looking for, compare products, or answer any questions you have about items in our catalog.\\n\\nHow can I assist you with your shopping today? Are you looking for a specific product, or do you need help finding something within a certain budget?", "type": "text"}]	2026-07-28 15:43:00.732354+00
cc103702-0ae1-4e6e-9884-a34bfdbe8b1e	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	user	[{"text": "hi", "type": "text"}]	2026-07-28 16:49:37.726377+00
b65aeaf4-b25d-40fc-96d8-6c2779ded10d	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	assistant	[{"text": "Hello! How can I help you today? Whether you're looking for recommendations, need help comparing products, or have questions about our current items, I'm here to assist you!", "type": "text"}]	2026-07-28 16:49:40.720525+00
d43fe996-7fdf-4e8e-8b7d-8b1fa11d713e	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	user	[{"text": "hi", "type": "text"}]	2026-07-28 16:50:35.790251+00
7421bdd6-ffbc-4a1c-94a2-4a0831a53fa5	191a6ee7-3ef6-4ac9-a8c1-4dd10f4c5358	assistant	[{"text": "Hello! How can I help you with your shopping today? Are you still looking for the perfect pair of shoes, or is there something else I can assist you with?", "type": "text"}]	2026-07-28 16:50:38.771377+00
39ff00cd-6f47-47e1-8b92-44b43fcff03e	216b565e-7ef6-49ad-b2f3-4a35ab0c53f9	user	[{"text": "Help me find the right product", "type": "text"}]	2026-07-28 17:23:48.764099+00
12930624-b4dc-4e48-b321-35f7aaf249ba	216b565e-7ef6-49ad-b2f3-4a35ab0c53f9	assistant	[{"text": "I have searched our catalog for shoes under $60, and I found a great option that fits your budget perfectly!\\n\\n### Product Recommendation\\n\\n<product-card>\\n  **Nike Air Max 270**\\n  - **Price:** $59\\n  - **Description:** Stylish sneakers featuring responsive cushioning for everyday comfort.\\n  - **Features:** Breathable upper, signature Air Max cushioning, excellent support and durability.\\n  - **Available Colors:** Gray, White\\n  - **Available Sizes:** 40, 42, 43, 44\\n</product-card>\\n\\nWhile the other options I found (the Adidas EQT Advance and Nike Ultraboost Pulse) are currently priced slightly above $60, the **Nike Air Max 270** is a fantastic choice that falls right within your range.\\n\\nWould you like to know more about the features of this shoe, or should I keep looking for other options for you?", "type": "text"}, {"type": "product_recommendations", "products": [{"id": 30, "name": "Adidas EQT Advance", "price": 79, "sizes": ["48", "44", "46", "41", "40", "42", "37"], "colors": ["black"], "images": {"black": "https://res.cloudinary.com/zobugm28/image/upload/v1784215092/shlwqmks7lgrwdqnjkny.jpg"}, "createdAt": "2026-07-16T15:19:26.520Z", "updatedAt": "2026-07-16T15:19:26.520Z", "description": "The Adidas EQT Advance features a breathable knit upper, lightweight cushioning, and a supportive fit for all-day comfort. Inspired by the classic Equipment series, it blends sporty performance with contemporary street style, making it ideal for everyday wear, casual outings, and light training sessions.", "categorySlug": "shoes", "shortDescription": "A lightweight lifestyle sneaker that gives modern comfort."}, {"id": 28, "name": "Nike Ultraboost Pulse ", "price": 69, "sizes": ["40", "42", "43"], "colors": ["gray", "pink"], "images": {"gray": "/products/7g.png", "pink": "/products/7p.png"}, "createdAt": "2026-07-11T10:54:44.163Z", "updatedAt": "2026-07-11T10:54:44.163Z", "description": "The Nike Ultraboost Pulse offers lightweight construction, cushioned support, and excellent responsiveness for both running and everyday wear. Its breathable upper keeps your feet cool while the flexible sole provides a smooth and comfortable stride.", "categorySlug": "shoes", "shortDescription": "Performance running shoes built for responsive cushioning and energy return."}, {"id": 27, "name": "Nike Air Max 270", "price": 59, "sizes": ["40", "42", "43", "44"], "colors": ["gray", "white"], "images": {"gray": "/products/6g.png", "white": "/products/6w.png"}, "createdAt": "2026-07-11T10:52:54.671Z", "updatedAt": "2026-07-11T10:52:54.671Z", "description": "The Nike Air Max 270 combines a breathable upper with the signature Air Max cushioning to provide exceptional comfort throughout the day. Whether you're walking around the city or wearing them casually, these sneakers deliver excellent support, durability, and modern style.", "categorySlug": "shoes", "shortDescription": "Stylish sneakers featuring responsive cushioning for everyday comfort."}]}]	2026-07-28 17:24:32.202392+00
367ac41c-6ae4-4ab0-951c-6c95ccf2a24d	216b565e-7ef6-49ad-b2f3-4a35ab0c53f9	user	[{"text": "i need to find a tshirt around 30 dollers", "type": "text"}]	2026-07-28 17:27:13.863726+00
a8e1b21d-5565-4ec9-a624-70178ac235b8	8572805b-6b27-43c1-b6fa-678c92f776a4	assistant	[{"text": "I would be happy to help! Product specifications (or \\"specs\\") are the technical details that describe exactly what a product is made of, how it performs, and what its capabilities are.\\n\\nDepending on what you are looking at—whether it's electronics, home appliances, or something else—the terminology can get a little confusing.\\n\\n**To get started, could you tell me:**\\n1. **What kind of product are you looking at?** (e.g., a laptop, a washing machine, a camera)\\n2. **Are there any specific terms or numbers that you don't recognize?** (e.g., RAM vs. Storage, Wattage, Lumens, ISO, etc.)\\n\\nOnce you let me know, I can break down exactly what those specs mean and whether they meet your specific needs!", "type": "text"}]	2026-07-29 00:08:23.648785+00
6379b765-f334-4870-a01a-1a83a5222c65	2b093027-d9f3-4526-9ff5-cb1ff9daa06b	user	[{"text": "hi", "type": "text"}]	2026-07-29 00:21:51.438165+00
b1c390eb-3577-436b-aeac-428667440437	1671e58a-227a-4ab4-99d7-3b0c055b4cad	assistant	[{"text": "Hello! I am your Ominify AI Shopping Assistant. I'm here to help you find exactly what you're looking for, compare products, or answer any questions you have about specifications.\\n\\nHow can I assist you with your shopping today? Are you looking for a specific item, or would you like some recommendations?", "type": "text"}]	2026-07-29 00:22:51.810639+00
656675c3-072c-405e-b727-beaaf5cca391	1671e58a-227a-4ab4-99d7-3b0c055b4cad	user	[{"text": "hello", "type": "text"}]	2026-07-29 00:23:03.539365+00
9760ec24-400b-4169-bf4e-85a097fc56dd	8572805b-6b27-43c1-b6fa-678c92f776a4	user	[{"text": "Can you explain specifications for me?", "type": "text"}]	2026-07-29 00:08:20.820885+00
f452193a-40a3-4420-834e-f4a7ebe2648e	2b093027-d9f3-4526-9ff5-cb1ff9daa06b	assistant	[{"text": "Hello! I am your Ominify AI Shopping Assistant. I'm here to help you find exactly what you're looking for, whether you need product recommendations, help comparing features, or assistance staying within a specific budget.\\n\\nHow can I help you with your shopping today?", "type": "text"}]	2026-07-29 00:21:53.533451+00
bfd8a809-3627-473c-8e28-f3682eb77158	1671e58a-227a-4ab4-99d7-3b0c055b4cad	user	[{"text": "hi", "type": "text"}]	2026-07-29 00:22:50.119174+00
f8319647-ad8b-4f1e-a7fd-a8efa26e49f8	1671e58a-227a-4ab4-99d7-3b0c055b4cad	assistant	[{"text": "Hello! How can I help you with your shopping today? Whether you're looking for something specific, need a product comparison, or want some recommendations, I'm here to assist!", "type": "text"}]	2026-07-29 00:23:05.032468+00
f4949a6a-5743-4488-b314-557c49ca2620	1e68ee36-c371-4ee8-9ffa-90067437fbc1	user	[{"text": "hi", "type": "text"}]	2026-08-03 07:45:11.978963+00
2e6f225a-b25b-483b-988a-aa4e1c1326d4	1e68ee36-c371-4ee8-9ffa-90067437fbc1	assistant	[{"text": "Hello! I am your Ominify AI Shopping Assistant. I'm here to help you find exactly what you're looking for, compare products, or answer any questions you have about items in our catalog.\\n\\nHow can I help you with your shopping today? Are you looking for something specific, or perhaps looking for a recommendation?", "type": "text"}]	2026-08-03 07:45:14.230775+00
45dbf0f3-2db0-496d-a95b-3ed130fcad97	1e68ee36-c371-4ee8-9ffa-90067437fbc1	user	[{"text": "i want to buy shoes under 39 dollers", "type": "text"}]	2026-08-03 07:45:33.184538+00
71751e37-ff78-4a98-9bc2-b5cd897f205c	1e68ee36-c371-4ee8-9ffa-90067437fbc1	assistant	[{"text": "I apologize, but it looks like we don't currently have any shoes in our catalog priced under $39. Our current selection includes options starting at $59.\\n\\nWould you like me to look for accessories, or perhaps you'd like to see some of our options that are slightly above your budget? I can help you compare features if any of those catch your eye!", "type": "text"}, {"type": "product_recommendations", "products": [{"id": 30, "name": "Adidas EQT Advance", "price": 79, "sizes": ["48", "44", "46", "41", "40", "42", "37"], "colors": ["black"], "images": {"black": "https://res.cloudinary.com/zobugm28/image/upload/v1784215092/shlwqmks7lgrwdqnjkny.jpg"}, "createdAt": "2026-07-16T15:19:26.520Z", "updatedAt": "2026-07-16T15:19:26.520Z", "description": "The Adidas EQT Advance features a breathable knit upper, lightweight cushioning, and a supportive fit for all-day comfort. Inspired by the classic Equipment series, it blends sporty performance with contemporary street style, making it ideal for everyday wear, casual outings, and light training sessions.", "categorySlug": "shoes", "shortDescription": "A lightweight lifestyle sneaker that gives modern comfort."}, {"id": 28, "name": "Nike Ultraboost Pulse ", "price": 69, "sizes": ["40", "42", "43"], "colors": ["gray", "pink"], "images": {"gray": "/products/7g.png", "pink": "/products/7p.png"}, "createdAt": "2026-07-11T10:54:44.163Z", "updatedAt": "2026-07-11T10:54:44.163Z", "description": "The Nike Ultraboost Pulse offers lightweight construction, cushioned support, and excellent responsiveness for both running and everyday wear. Its breathable upper keeps your feet cool while the flexible sole provides a smooth and comfortable stride.", "categorySlug": "shoes", "shortDescription": "Performance running shoes built for responsive cushioning and energy return."}, {"id": 27, "name": "Nike Air Max 270", "price": 59, "sizes": ["40", "42", "43", "44"], "colors": ["gray", "white"], "images": {"gray": "/products/6g.png", "white": "/products/6w.png"}, "createdAt": "2026-07-11T10:52:54.671Z", "updatedAt": "2026-07-11T10:52:54.671Z", "description": "The Nike Air Max 270 combines a breathable upper with the signature Air Max cushioning to provide exceptional comfort throughout the day. Whether you're walking around the city or wearing them casually, these sneakers deliver excellent support, durability, and modern style.", "categorySlug": "shoes", "shortDescription": "Stylish sneakers featuring responsive cushioning for everyday comfort."}]}]	2026-08-03 07:45:35.075407+00
12842406-e332-40e2-8b98-af3533ceb87e	97a9d04d-b9a8-4926-b338-8aa5194d4cf1	user	[{"text": "Help me shop within my budget", "type": "text"}]	2026-08-03 07:46:03.05118+00
86c65e98-2cbd-4da1-9b38-4a98bacf9d3b	97a9d04d-b9a8-4926-b338-8aa5194d4cf1	assistant	[{"text": "I would be happy to help you shop within your budget! To provide you with the best recommendations, could you please tell me a little more about what you are looking for?\\n\\nTo get started, please let me know:\\n\\n1.  **What are you looking to purchase?** (e.g., a laptop, kitchen appliances, running shoes, etc.)\\n2.  **What is your target budget range?**\\n3.  **Are there any specific features, brands, or requirements** I should keep in mind while searching?\\n\\nOnce you provide those details, I can search our catalog, compare top-rated options for you, and help you find the best value for your money.", "type": "text"}]	2026-08-03 07:46:05.643909+00
e33407cc-75aa-48e2-bfdc-94cb5fa30e05	97a9d04d-b9a8-4926-b338-8aa5194d4cf1	user	[{"text": "i want to buy a tshirt around 30 dollers", "type": "text"}]	2026-08-03 08:11:09.058909+00
73ccb850-3507-4e92-ba03-2ecf99088ff9	97a9d04d-b9a8-4926-b338-8aa5194d4cf1	assistant	[{"text": "I've searched our current catalog for T-shirts near your $30 budget. It looks like our current stock features some higher-end performance fleece and zip-up options that are slightly above your $30 target.\\n\\nSince I don't have a basic cotton tee in stock at that specific price point right now, would you like me to:\\n\\n1. **Broaden the search:** I can look for other casual apparel categories that might fit your budget?\\n2. **Keep an eye out:** I can let you know if we receive new inventory that hits that $30 mark?\\n\\nAlso, were you looking for a specific style (like a plain crew neck, graphic tee, or perhaps an athletic performance shirt)? Let me know, and I’ll do my best to help you find exactly what you need!", "type": "text"}, {"type": "product_recommendations", "products": [{"id": 26, "name": "Under Armour StormFleece", "price": 49, "sizes": ["s", "m", "l"], "colors": ["red", "orange", "black"], "images": {"red": "/products/5r.png", "black": "/products/5bl.png", "orange": "/products/5o.png"}, "createdAt": "2026-07-11T10:52:43.256Z", "updatedAt": "2026-07-11T10:52:43.256Z", "description": "The Under Armour StormFleece delivers superior warmth with a soft interior and weather-resistant exterior. It provides excellent comfort without adding unnecessary weight, making it suitable for outdoor adventures, workouts, and casual daily wear.", "categorySlug": "t-shirt", "shortDescription": "A warm fleece sweatshirt designed for comfort in cold weather conditions."}, {"id": 23, "name": "Puma Ultra Warm Zip", "price": 59, "sizes": ["s", "m", "l", "xl"], "colors": ["gray", "green"], "images": {"gray": "/products/2g.png", "green": "/products/2gr.png"}, "createdAt": "2026-07-11T10:52:16.557Z", "updatedAt": "2026-07-11T10:52:16.557Z", "description": "The Puma Ultra Warm Zip combines a soft fleece interior with a durable outer layer for reliable warmth and comfort. Featuring a full-length zipper and relaxed fit, it is ideal for outdoor activities, commuting, or layering during chilly days without sacrificing style.", "categorySlug": "t-shirt", "shortDescription": "A comfortable zip-up sweatshirt built to provide warmth in cooler weather."}]}]	2026-08-03 08:11:12.095091+00
68f1be30-2bcc-48f0-9074-45fa1cdd868b	22b63e9a-4c6c-4f7a-bb73-f086fab31373	user	[{"text": "hi", "type": "text"}]	2026-08-08 09:53:50.260477+00
b8922bbe-f053-44bc-ba02-0a3733eec18a	22b63e9a-4c6c-4f7a-bb73-f086fab31373	assistant	[{"text": "Hello! I am your Ominify AI Shopping Assistant. I'm here to help you find the perfect products, compare specifications, or plan your shopping budget.\\n\\nHow can I assist you today? Are you looking for something specific, or would you like to browse some of our latest categories?", "type": "text"}]	2026-08-08 09:53:52.459482+00
ee1cb1f1-53ff-4df8-a9a3-ff449fe052f3	22b63e9a-4c6c-4f7a-bb73-f086fab31373	user	[{"text": "i need to buy t shirt under 30 doller", "type": "text"}]	2026-08-08 09:54:24.672358+00
6e7050f5-d1f2-45ed-92a5-93473c09cea4	22b63e9a-4c6c-4f7a-bb73-f086fab31373	assistant	[{"text": "I have found a great option for you that fits your budget of $30:\\n\\n```json\\n[\\n  {\\n    \\"id\\": 25,\\n    \\"name\\": \\"Nike Dri Flex T-Shirt\\",\\n    \\"price\\": 29,\\n    \\"shortDescription\\": \\"A breathable sports t-shirt engineered to keep you dry and comfortable.\\",\\n    \\"description\\": \\"The Nike Dri Flex T-Shirt uses moisture-wicking technology to quickly draw sweat away from your skin, helping you stay cool during intense workouts. Its lightweight construction and flexible fabric allow natural movement, making it a dependable choice for training and everyday activities.\\",\\n    \\"image\\": \\"/products/4w.png\\",\\n    \\"colors\\": [\\"white\\", \\"pink\\"],\\n    \\"sizes\\": [\\"s\\", \\"m\\", \\"l\\"]\\n  }\\n]\\n```\\n\\nWould you like to know more about this shirt, or should I look for other options if this one isn't quite what you had in mind?", "type": "text"}, {"type": "product_recommendations", "products": [{"id": 29, "name": "Levi’s Classic Denim", "price": 59, "sizes": ["s", "m", "l"], "colors": ["blue", "green"], "images": {"blue": "/products/8b.png", "green": "/products/8gr.png"}, "createdAt": "2026-07-11T10:54:51.508Z", "updatedAt": "2026-07-11T10:54:51.508Z", "description": "The Levi's Classic Denim jacket is made from durable premium denim with a comfortable fit that complements any casual wardrobe. Designed for year-round wear, it pairs effortlessly with jeans, chinos, or joggers, making it a reliable choice for everyday fashion.", "categorySlug": "t-shirt", "shortDescription": "A timeless denim jacket offering durability and versatile everyday style."}, {"id": 26, "name": "Under Armour StormFleece", "price": 49, "sizes": ["s", "m", "l"], "colors": ["red", "orange", "black"], "images": {"red": "/products/5r.png", "black": "/products/5bl.png", "orange": "/products/5o.png"}, "createdAt": "2026-07-11T10:52:43.256Z", "updatedAt": "2026-07-11T10:52:43.256Z", "description": "The Under Armour StormFleece delivers superior warmth with a soft interior and weather-resistant exterior. It provides excellent comfort without adding unnecessary weight, making it suitable for outdoor adventures, workouts, and casual daily wear.", "categorySlug": "t-shirt", "shortDescription": "A warm fleece sweatshirt designed for comfort in cold weather conditions."}, {"id": 25, "name": "Nike Dri Flex T-Shirt", "price": 29, "sizes": ["s", "m", "l"], "colors": ["white", "pink"], "images": {"pink": "/products/4p.png", "white": "/products/4w.png"}, "createdAt": "2026-07-11T10:52:35.603Z", "updatedAt": "2026-07-11T10:52:35.603Z", "description": "The Nike Dri Flex T-Shirt uses moisture-wicking technology to quickly draw sweat away from your skin, helping you stay cool during intense workouts. Its lightweight construction and flexible fabric allow natural movement, making it a dependable choice for training and everyday activities.", "categorySlug": "t-shirt", "shortDescription": "A breathable sports t-shirt engineered to keep you dry and comfortable."}, {"id": 24, "name": "Nike Air Essentials Pullover", "price": 69, "sizes": ["s", "m", "l"], "colors": ["green", "blue", "black"], "images": {"blue": "/products/3b.png", "black": "/products/3bl.png", "green": "/products/3gr.png"}, "createdAt": "2026-07-11T10:52:27.110Z", "updatedAt": "2026-07-11T10:52:27.110Z", "description": "The Nike Air Essentials Pullover features soft brushed fabric that provides excellent insulation while remaining lightweight. Its relaxed design makes it suitable for workouts, travel, or casual everyday wear, delivering both performance and timeless style.", "categorySlug": "t-shirt", "shortDescription": "A premium pullover offering warmth, comfort, and a modern athletic look."}, {"id": 23, "name": "Puma Ultra Warm Zip", "price": 59, "sizes": ["s", "m", "l", "xl"], "colors": ["gray", "green"], "images": {"gray": "/products/2g.png", "green": "/products/2gr.png"}, "createdAt": "2026-07-11T10:52:16.557Z", "updatedAt": "2026-07-11T10:52:16.557Z", "description": "The Puma Ultra Warm Zip combines a soft fleece interior with a durable outer layer for reliable warmth and comfort. Featuring a full-length zipper and relaxed fit, it is ideal for outdoor activities, commuting, or layering during chilly days without sacrificing style.", "categorySlug": "t-shirt", "shortDescription": "A comfortable zip-up sweatshirt built to provide warmth in cooler weather."}, {"id": 22, "name": "Adidas CoreFit T-Shirt", "price": 39, "sizes": ["s", "m", "l", "xl", "xxl"], "colors": ["gray", "purple", "green"], "images": {"gray": "/products/1g.png", "green": "/products/1gr.png", "purple": "/products/1p.png"}, "createdAt": "2026-07-11T10:48:25.660Z", "updatedAt": "2026-07-11T10:48:25.660Z", "description": "The Adidas CoreFit T-Shirt is crafted from breathable, moisture-wicking fabric to keep you cool during workouts and casual wear. Its athletic fit provides unrestricted movement while the soft material ensures lasting comfort throughout the day. Perfect for training sessions, running, or everyday styling.", "categorySlug": "t-shirt", "shortDescription": "A lightweight performance t-shirt designed for all-day comfort and active movement."}]}]	2026-08-08 09:54:26.916159+00
\.


--
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- Name: conversations conversations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.conversations
    ADD CONSTRAINT conversations_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);


--
-- Name: idx_conversations_user_updated; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_conversations_user_updated ON public.conversations USING btree (user_id, updated_at);


--
-- Name: idx_messages_conversation_created; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX idx_messages_conversation_created ON public.messages USING btree (conversation_id, created_at);


--
-- Name: ix_conversations_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_conversations_id ON public.conversations USING btree (id);


--
-- Name: ix_conversations_user_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_conversations_user_id ON public.conversations USING btree (user_id);


--
-- Name: ix_messages_conversation_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_messages_conversation_id ON public.messages USING btree (conversation_id);


--
-- Name: ix_messages_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX ix_messages_id ON public.messages USING btree (id);


--
-- Name: messages messages_conversation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) REFERENCES public.conversations(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict 2avfJWChYdScsbcKhIi1pNP5d16u5yk8Rz47wTv5gtETAm5K7F9fHogBHevGEqp

--
-- Database "postgres" dump
--

\connect postgres

--
-- PostgreSQL database dump
--

\restrict yr5IFMfxn18honI4PMCfxSjvG4pyimthKIinxscefFBnKPPMkqeFyhDx0y2ZLPz

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- PostgreSQL database dump complete
--

\unrestrict yr5IFMfxn18honI4PMCfxSjvG4pyimthKIinxscefFBnKPPMkqeFyhDx0y2ZLPz

--
-- Database "products" dump
--

--
-- PostgreSQL database dump
--

\restrict EbVbbPXsYImRWmbzkoU3yujvhytuDyWa3HpeNqyT4DAFpVhenvdMreHhxQLwfiw

-- Dumped from database version 18.4 (Debian 18.4-1.pgdg13+1)
-- Dumped by pg_dump version 18.4 (Debian 18.4-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: products; Type: DATABASE; Schema: -; Owner: admin
--

CREATE DATABASE products WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'en_US.utf8';


ALTER DATABASE products OWNER TO admin;

\unrestrict EbVbbPXsYImRWmbzkoU3yujvhytuDyWa3HpeNqyT4DAFpVhenvdMreHhxQLwfiw
\connect products
\restrict EbVbbPXsYImRWmbzkoU3yujvhytuDyWa3HpeNqyT4DAFpVhenvdMreHhxQLwfiw

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Category; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Category" (
    id integer NOT NULL,
    name text NOT NULL,
    slug text NOT NULL
);


ALTER TABLE public."Category" OWNER TO admin;

--
-- Name: Category_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Category_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Category_id_seq" OWNER TO admin;

--
-- Name: Category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Category_id_seq" OWNED BY public."Category".id;


--
-- Name: Product; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Product" (
    id integer NOT NULL,
    name text NOT NULL,
    "shortDescription" text NOT NULL,
    description text NOT NULL,
    price integer NOT NULL,
    sizes text[],
    colors text[],
    images jsonb NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "categorySlug" text NOT NULL
);


ALTER TABLE public."Product" OWNER TO admin;

--
-- Name: Product_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Product_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Product_id_seq" OWNER TO admin;

--
-- Name: Product_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Product_id_seq" OWNED BY public."Product".id;


--
-- Name: Wishlist; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public."Wishlist" (
    id integer NOT NULL,
    "userId" text NOT NULL,
    "productId" integer NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Wishlist" OWNER TO admin;

--
-- Name: Wishlist_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public."Wishlist_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public."Wishlist_id_seq" OWNER TO admin;

--
-- Name: Wishlist_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public."Wishlist_id_seq" OWNED BY public."Wishlist".id;


--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO admin;

--
-- Name: Category id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Category" ALTER COLUMN id SET DEFAULT nextval('public."Category_id_seq"'::regclass);


--
-- Name: Product id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Product" ALTER COLUMN id SET DEFAULT nextval('public."Product_id_seq"'::regclass);


--
-- Name: Wishlist id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Wishlist" ALTER COLUMN id SET DEFAULT nextval('public."Wishlist_id_seq"'::regclass);


--
-- Data for Name: Category; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Category" (id, name, slug) FROM stdin;
5	T-Shirt	t-shirt
6	Shoes	shoes
7	Caps	caps
8	Camera	camera
\.


--
-- Data for Name: Product; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Product" (id, name, "shortDescription", description, price, sizes, colors, images, "createdAt", "updatedAt", "categorySlug") FROM stdin;
22	Adidas CoreFit T-Shirt	A lightweight performance t-shirt designed for all-day comfort and active movement.	The Adidas CoreFit T-Shirt is crafted from breathable, moisture-wicking fabric to keep you cool during workouts and casual wear. Its athletic fit provides unrestricted movement while the soft material ensures lasting comfort throughout the day. Perfect for training sessions, running, or everyday styling.	39	{s,m,l,xl,xxl}	{gray,purple,green}	{"gray": "/products/1g.png", "green": "/products/1gr.png", "purple": "/products/1p.png"}	2026-07-11 10:48:25.66	2026-07-11 10:48:25.66	t-shirt
23	Puma Ultra Warm Zip	A comfortable zip-up sweatshirt built to provide warmth in cooler weather.	The Puma Ultra Warm Zip combines a soft fleece interior with a durable outer layer for reliable warmth and comfort. Featuring a full-length zipper and relaxed fit, it is ideal for outdoor activities, commuting, or layering during chilly days without sacrificing style.	59	{s,m,l,xl}	{gray,green}	{"gray": "/products/2g.png", "green": "/products/2gr.png"}	2026-07-11 10:52:16.557	2026-07-11 10:52:16.557	t-shirt
24	Nike Air Essentials Pullover	A premium pullover offering warmth, comfort, and a modern athletic look.	The Nike Air Essentials Pullover features soft brushed fabric that provides excellent insulation while remaining lightweight. Its relaxed design makes it suitable for workouts, travel, or casual everyday wear, delivering both performance and timeless style.	69	{s,m,l}	{green,blue,black}	{"blue": "/products/3b.png", "black": "/products/3bl.png", "green": "/products/3gr.png"}	2026-07-11 10:52:27.11	2026-07-11 10:52:27.11	t-shirt
25	Nike Dri Flex T-Shirt	A breathable sports t-shirt engineered to keep you dry and comfortable.	The Nike Dri Flex T-Shirt uses moisture-wicking technology to quickly draw sweat away from your skin, helping you stay cool during intense workouts. Its lightweight construction and flexible fabric allow natural movement, making it a dependable choice for training and everyday activities.	29	{s,m,l}	{white,pink}	{"pink": "/products/4p.png", "white": "/products/4w.png"}	2026-07-11 10:52:35.603	2026-07-11 10:52:35.603	t-shirt
26	Under Armour StormFleece	A warm fleece sweatshirt designed for comfort in cold weather conditions.	The Under Armour StormFleece delivers superior warmth with a soft interior and weather-resistant exterior. It provides excellent comfort without adding unnecessary weight, making it suitable for outdoor adventures, workouts, and casual daily wear.	49	{s,m,l}	{red,orange,black}	{"red": "/products/5r.png", "black": "/products/5bl.png", "orange": "/products/5o.png"}	2026-07-11 10:52:43.256	2026-07-11 10:52:43.256	t-shirt
27	Nike Air Max 270	Stylish sneakers featuring responsive cushioning for everyday comfort.	The Nike Air Max 270 combines a breathable upper with the signature Air Max cushioning to provide exceptional comfort throughout the day. Whether you're walking around the city or wearing them casually, these sneakers deliver excellent support, durability, and modern style.	59	{40,42,43,44}	{gray,white}	{"gray": "/products/6g.png", "white": "/products/6w.png"}	2026-07-11 10:52:54.671	2026-07-11 10:52:54.671	shoes
28	Nike Ultraboost Pulse 	Performance running shoes built for responsive cushioning and energy return.	The Nike Ultraboost Pulse offers lightweight construction, cushioned support, and excellent responsiveness for both running and everyday wear. Its breathable upper keeps your feet cool while the flexible sole provides a smooth and comfortable stride.	69	{40,42,43}	{gray,pink}	{"gray": "/products/7g.png", "pink": "/products/7p.png"}	2026-07-11 10:54:44.163	2026-07-11 10:54:44.163	shoes
29	Levi’s Classic Denim	A timeless denim jacket offering durability and versatile everyday style.	The Levi's Classic Denim jacket is made from durable premium denim with a comfortable fit that complements any casual wardrobe. Designed for year-round wear, it pairs effortlessly with jeans, chinos, or joggers, making it a reliable choice for everyday fashion.	59	{s,m,l}	{blue,green}	{"blue": "/products/8b.png", "green": "/products/8gr.png"}	2026-07-11 10:54:51.508	2026-07-11 10:54:51.508	t-shirt
30	Adidas EQT Advance	A lightweight lifestyle sneaker that gives modern comfort.	The Adidas EQT Advance features a breathable knit upper, lightweight cushioning, and a supportive fit for all-day comfort. Inspired by the classic Equipment series, it blends sporty performance with contemporary street style, making it ideal for everyday wear, casual outings, and light training sessions.	79	{48,44,46,41,40,42,37}	{black}	{"black": "https://res.cloudinary.com/zobugm28/image/upload/v1784215092/shlwqmks7lgrwdqnjkny.jpg"}	2026-07-16 15:19:26.52	2026-07-16 15:19:26.52	shoes
\.


--
-- Data for Name: Wishlist; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public."Wishlist" (id, "userId", "productId", "createdAt") FROM stdin;
3	user_3D6fs6SmzCKV0AjuqPlobQ5eDso	26	2026-07-27 03:26:01.168
4	user_3D6fs6SmzCKV0AjuqPlobQ5eDso	23	2026-07-27 03:26:03.372
5	user_3D6fs6SmzCKV0AjuqPlobQ5eDso	30	2026-07-27 06:02:53.201
6	user_3D6fs6SmzCKV0AjuqPlobQ5eDso	28	2026-07-28 15:37:12.119
10	user_3D6fs6SmzCKV0AjuqPlobQ5eDso	29	2026-07-29 18:40:49.142
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: admin
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
b7fc5976-8a25-485f-a7ae-285847193f36	54189f662526f56efb4983d1b986b5bbdd07625174440e93a5942c0e11098130	2026-05-18 15:43:06.630695+00	20260518154306_create_product_and_category	\N	\N	2026-05-18 15:43:06.593364+00	1
26f1be2b-9e89-4a6a-9a48-564a445fb0c1	7b0990ebc6b0a7a114f2482a21413ced0cc0ea11fdca43074c903f18e6e240c8	2026-07-27 03:25:11.039571+00	20260727000000_create_wishlist	\N	\N	2026-07-27 03:25:10.915244+00	1
\.


--
-- Name: Category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."Category_id_seq"', 10, true);


--
-- Name: Product_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."Product_id_seq"', 30, true);


--
-- Name: Wishlist_id_seq; Type: SEQUENCE SET; Schema: public; Owner: admin
--

SELECT pg_catalog.setval('public."Wishlist_id_seq"', 10, true);


--
-- Name: Category Category_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Category"
    ADD CONSTRAINT "Category_pkey" PRIMARY KEY (id);


--
-- Name: Product Product_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_pkey" PRIMARY KEY (id);


--
-- Name: Wishlist Wishlist_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Category_slug_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Category_slug_key" ON public."Category" USING btree (slug);


--
-- Name: Wishlist_userId_productId_key; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX "Wishlist_userId_productId_key" ON public."Wishlist" USING btree ("userId", "productId");


--
-- Name: Product Product_categorySlug_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Product"
    ADD CONSTRAINT "Product_categorySlug_fkey" FOREIGN KEY ("categorySlug") REFERENCES public."Category"(slug) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Wishlist Wishlist_productId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public."Wishlist"
    ADD CONSTRAINT "Wishlist_productId_fkey" FOREIGN KEY ("productId") REFERENCES public."Product"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict EbVbbPXsYImRWmbzkoU3yujvhytuDyWa3HpeNqyT4DAFpVhenvdMreHhxQLwfiw

--
-- PostgreSQL database cluster dump complete
--

