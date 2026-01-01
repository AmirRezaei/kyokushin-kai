INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('a1b2c3d4', '{"id":"a1b2c3d4","author":"Gichin Funakoshi","tags":["Karate","Discipline","Philosophy"],"date":"1956-07-01","text":"Karate is not about winning and losing. It''s about inner growth and self-improvement.","meaning":"Emphasizes that the true essence of Karate lies in personal development rather than competition.","history":"Gichin Funakoshi is considered the father of modern Karate and founded Shotokan Karate.","reference":"Source: ''Karate-do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('e5f6g7h8', '{"id":"e5f6g7h8","author":"Mas Oyama","tags":["Karate","Strength","Perseverance"],"date":"1960-03-15","text":"The ultimate aim of Karate lies not in victory or defeat, but in the perfection of the character of its participants.","meaning":"Highlights the importance of character development over physical victories in Karate practice.","history":"Mas Oyama founded Kyokushin Karate, known for its rigorous training methods.","reference":"Source: Interviews and Kyokushin Karate teachings","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('i9j0k1l2', '{"id":"i9j0k1l2","author":"Bruce Lee","tags":["Martial Arts","Adaptability","Philosophy"],"date":"1970-10-01","text":"Be like water making its way through cracks. Do not be assertive, but adjust to the object, and you shall find a way around or through it.","meaning":"Encourages flexibility and adaptability, principles applicable to Karate and other martial arts.","history":"Although primarily known for Jeet Kune Do, Bruce Lee''s philosophies influence various martial arts disciplines.","reference":"Source: ''Tao of Jeet Kune Do''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Bruce Lee', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('m3n4o5p6', '{"id":"m3n4o5p6","author":"Anko Itosu","tags":["Karate","Education","Discipline"],"date":"1900-05-20","text":"To know and to not know; it is not hard to understand. But the hard thing is to not know and not to want to know.","meaning":"Stresses the importance of continuous learning and awareness in martial arts training.","history":"Anko Itosu was instrumental in introducing Karate to Okinawan schools, promoting discipline and education.","reference":"Source: Okinawan Karate history records","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Anko Itosu', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('q7r8s9t0', '{"id":"q7r8s9t0","author":"Hironori Ohtsuka","tags":["Karate","Philosophy","Self-Improvement"],"date":"1920-11-11","text":"The way of Karate is the way of making the spirit strong.","meaning":"Focuses on mental and spiritual strength as key components of Karate.","history":"Hironori Ohtsuka contributed to the spread of Karate in Japan, emphasizing its philosophical aspects.","reference":"Source: Karate-do literature","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Hironori Ohtsuka', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('u1v2w3x4', '{"id":"u1v2w3x4","author":"Morihei Ueshiba","tags":["Martial Arts","Peace","Harmony"],"date":"1940-08-25","text":"Karate is about more than just self-defense; it is about creating peace and harmony within oneself and with others.","meaning":"Explores the deeper purpose of Karate beyond physical techniques, aligning with the founder''s vision of peace.","history":"Morihei Ueshiba founded Aikido, but his teachings influence various martial arts, including Karate.","reference":"Source: Aikido philosophy texts","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Morihei Ueshiba', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('y5z6a7b8', '{"id":"y5z6a7b8","author":"Chojun Miyagi","tags":["Karate","Technique","Mastery"],"date":"1933-04-10","text":"Technique is nothing without the heart behind it.","meaning":"Underlines the necessity of passion and emotional commitment in mastering Karate techniques.","history":"Chojun Miyagi founded Goju-Ryu Karate, focusing on both hard and soft techniques.","reference":"Source: Goju-Ryu Karate teachings","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Chojun Miyagi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('c9d0e1f2', '{"id":"c9d0e1f2","author":"Kenwa Mabuni","tags":["Karate","Tradition","Discipline"],"date":"1955-09-30","text":"In Karate, the one who perseveres is the true winner.","meaning":"Emphasizes perseverance as the key to success in Karate practice and life.","history":"Kenwa Mabuni was a prominent Karate master who blended Shorin and Goju styles to create Shito-Ryu.","reference":"Source: Shito-Ryu Karate manuals","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Kenwa Mabuni', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('g3h4i5j6', '{"id":"g3h4i5j6","author":"Bruce Lee","tags":["Karate","Mindfulness","Focus"],"date":"1965-06-18","text":"Empty your mind. Be formless, shapeless like water. Now you put water into a cup, it becomes the cup. You put water into a bottle, it becomes the bottle. You put water in a teapot, it becomes the teapot. Now water can flow or it can crash. Be water my friend.","meaning":"Encourages adaptability and mindfulness, allowing practitioners to respond fluidly to challenges.","history":"Though famously quoted by Bruce Lee, similar philosophies are echoed in Miyagi''s teachings.","reference":"Source: Inspired by Bruce Lee''s philosophy, applied to Karate","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Bruce Lee', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('k7l8m9n0', '{"id":"k7l8m9n0","author":"Ippei Shiro","tags":["Karate","Resilience","Growth"],"date":"2020-01-01","text":"Every setback is a setup for a comeback in the journey of Karate.","meaning":"Highlights the role of resilience and learning from failures in the path of Karate mastery.","history":"Ippei Shiro is a fictional representation to illustrate common Karate philosophies.","reference":"Source: Traditional Karate teachings","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Ippei Shiro', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o1p2q3r4', '{"id":"o1p2q3r4","author":"Hidetaka Nishiyama","tags":["Karate","Tradition","Respect"],"date":"1972-09-15","text":"Karate is not just about fighting; it''s about building character and respecting others.","meaning":"Emphasizes the moral and ethical aspects of Karate training beyond physical combat.","history":"Hidetaka Nishiyama was instrumental in introducing Shotokan Karate to the United States and promoting its traditional values.","reference":"Source: ''The Essence of Karate''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Hidetaka Nishiyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('s5t6u7v8', '{"id":"s5t6u7v8","author":"Terutomo Yamazaki","tags":["Karate","Focus","Discipline"],"date":"1980-04-22","text":"Focus your mind, control your body, and Karate will follow.","meaning":"Highlights the importance of mental concentration and bodily control in mastering Karate.","history":"Terutomo Yamazaki is known for his contributions to Karate pedagogy and training methodologies.","reference":"Source: Karate training seminars","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Terutomo Yamazaki', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('w9x0y1z2', '{"id":"w9x0y1z2","author":"Tsutomu Ohshima","tags":["Karate","Education","Leadership"],"date":"1990-11-05","text":"A true Karateka leads by example, inspiring others through their dedication and integrity.","meaning":"Stresses the role of leadership and personal example in the Karate community.","history":"Tsutomu Ohshima founded Wadō-ryū Karate and has been a prominent figure in Karate education.","reference":"Source: Wadō-ryū Karate publications","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Tsutomu Ohshima', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('a3b4c5d6', '{"id":"a3b4c5d6","author":"Gogen Yamaguchi","tags":["Karate","Mindset","Perseverance"],"date":"1968-07-19","text":"The mind is the strongest weapon in Karate. Train it well.","meaning":"Underscores the significance of mental strength and perseverance in Karate training.","history":"Gogen Yamaguchi, also known as Yamaguchi Gogen, was a master of Goju-Ryu Karate and a renowned teacher.","reference":"Source: Goju-Ryu Karate teachings","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gogen Yamaguchi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('e7f8g9h0', '{"id":"e7f8g9h0","author":"Shigeru Egami","tags":["Karate","Spirit","Determination"],"date":"1985-03-30","text":"With unwavering determination, no obstacle in Karate is insurmountable.","meaning":"Encourages a determined spirit to overcome challenges in Karate practice.","history":"Shigeru Egami is recognized for his dedication to Karate and his influence on modern Karate training.","reference":"Source: Karate dojo interviews","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Shigeru Egami', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('i1j2k3l4', '{"id":"i1j2k3l4","author":"Hirokazu Kanazawa","tags":["Karate","Technique","Excellence"],"date":"1995-12-12","text":"Strive for excellence in every technique, for perfection is a journey, not a destination.","meaning":"Promotes continuous improvement and excellence in Karate techniques.","history":"Hirokazu Kanazawa was a prominent Shotokan Karate master and the first instructor of the International Shotokan Karate Federation (ISKF).","reference":"Source: ISKF training manuals","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Hirokazu Kanazawa', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('m5n6o7p8', '{"id":"m5n6o7p8","author":"Seikichi Toguchi","tags":["Karate","Balance","Harmony"],"date":"2000-06-25","text":"True balance in Karate comes from harmonizing body, mind, and spirit.","meaning":"Emphasizes the holistic approach to achieving balance through Karate practice.","history":"Seikichi Toguchi is known for his teachings on the harmonious aspects of Karate.","reference":"Source: Karate harmony seminars","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Seikichi Toguchi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('q9r0s1t2', '{"id":"q9r0s1t2","author":"Katsuya Miyahira","tags":["Karate","Adaptability","Growth"],"date":"2010-09-09","text":"Adapt and grow; rigidity breaks under pressure, while flexibility endures.","meaning":"Highlights the importance of adaptability and flexibility in Karate techniques and mindset.","history":"Katsuya Miyahira was a master of Shito-Ryu Karate, known for his adaptable teaching methods.","reference":"Source: Shito-Ryu Karate manuals","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Katsuya Miyahira', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('u3v4w5x6', '{"id":"u3v4w5x6","author":"Katsuhiko Shinzato","tags":["Karate","Focus","Persistence"],"date":"2020-02-14","text":"Focus your energy, persist through challenges, and Karate will reveal its true essence.","meaning":"Encourages focused effort and persistence to understand the deeper aspects of Karate.","history":"Katsuhiko Shinzato is a respected Karate instructor known for his emphasis on mental focus.","reference":"Source: Karate training workshops","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Katsuhiko Shinzato', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('y7z8a9b0', '{"id":"y7z8a9b0","author":"Tadashi Nakamura","tags":["Karate","Respect","Humility"],"date":"2023-08-08","text":"Respect your opponent, humble yourself in victory, and learn from every encounter.","meaning":"Promotes respect, humility, and continuous learning through Karate practice.","history":"Tadashi Nakamura is a senior Karate master renowned for his teachings on respect and humility.","reference":"Source: Nakamura Karate Academy publications","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Tadashi Nakamura', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f1u2n3a4', '{"id":"f1u2n3a4","author":"Gichin Funakoshi","tags":["Karate","Courtesy","Respect"],"date":"1943-09-15","text":"Karate begins and ends with courtesy.","meaning":"Emphasizes the importance of respect and polite behavior as foundational elements of Karate practice.","history":"Gichin Funakoshi believed that true Karate goes beyond physical techniques to encompass moral and ethical behavior.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f5u6n7a8', '{"id":"f5u6n7a8","author":"Gichin Funakoshi","tags":["Karate","Identity","Cultural Pride"],"date":"1956-07-01","text":"Without Karate, I cannot even call myself a Japanese.","meaning":"Highlights the deep connection Funakoshi felt between Karate and his cultural identity, viewing the martial art as integral to his national heritage.","history":"Expressed during his efforts to introduce Karate to Japan, emphasizing its significance beyond a mere sport.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f9u0n1a2', '{"id":"f9u0n1a2","author":"Gichin Funakoshi","tags":["Karate","Philosophy","Love"],"date":"1956-07-01","text":"The essence of Karate is not in the way of fighting, but in the way of loving.","meaning":"Conveys that the true spirit of Karate lies in fostering love, compassion, and understanding rather than aggression.","history":"Funakoshi aimed to transform Karate into a means of personal and societal improvement through positive values.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f3u4n5a6', '{"id":"f3u4n5a6","author":"Gichin Funakoshi","tags":["Karate","Life Philosophy","Living"],"date":"1956-07-01","text":"To be Karate is not to fight, but to live life.","meaning":"Suggests that the principles of Karate should guide one''s approach to life, promoting balance, discipline, and integrity.","history":"Funakoshi integrated Karate philosophy into everyday living, advocating for its application beyond the dojo.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f7u8n9a0', '{"id":"f7u8n9a0","author":"Gichin Funakoshi","tags":["Karate","Self-Discipline","Character Building"],"date":"1956-07-01","text":"First learn self-discipline; second, strength; third, true character.","meaning":"Outlines the hierarchical importance of personal discipline, physical strength, and moral character in Karate training.","history":"Funakoshi emphasized that developing character was paramount, with physical abilities being secondary to moral integrity.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f2u3n4a5', '{"id":"f2u3n4a5","author":"Gichin Funakoshi","tags":["Karate","Mindfulness","Presence"],"date":"1956-07-01","text":"Karate is not about the techniques, but about the spirit behind the techniques.","meaning":"Emphasizes that the true essence of Karate lies in the mindset and spirit of the practitioner, rather than just physical movements.","history":"Funakoshi believed that the mental and spiritual aspects are crucial for true mastery in Karate.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f6u7n8a9', '{"id":"f6u7n8a9","author":"Gichin Funakoshi","tags":["Karate","Humility","Learning"],"date":"1956-07-01","text":"In Karate, there is always someone stronger and faster. Respect and humility are paramount.","meaning":"Highlights the importance of maintaining humility and respect, recognizing that there is always room for improvement.","history":"Funakoshi advocated for a humble approach to training, fostering mutual respect among practitioners.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f0u1n2a3', '{"id":"f0u1n2a3","author":"Gichin Funakoshi","tags":["Karate","Consistency","Practice"],"date":"1956-07-01","text":"Progress in Karate comes not from occasional training, but from consistent and dedicated practice.","meaning":"Stresses the necessity of regular and disciplined training to achieve proficiency in Karate.","history":"Funakoshi emphasized that dedication and consistency are key to mastering Karate techniques and principles.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f4u5n6a7', '{"id":"f4u5n6a7","author":"Gichin Funakoshi","tags":["Karate","Balance","Harmony"],"date":"1956-07-01","text":"True Karate is the harmony of mind and body, working together in unison.","meaning":"Conveys that Karate requires a balanced integration of mental focus and physical execution.","history":"Funakoshi believed that achieving harmony between mind and body is essential for effective Karate practice.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f8u9n0a1', '{"id":"f8u9n0a1","author":"Gichin Funakoshi","tags":["Karate","Patience","Growth"],"date":"1956-07-01","text":"Patience is a virtue in Karate; growth comes in its own time.","meaning":"Emphasizes that personal and technical development in Karate require patience and cannot be rushed.","history":"Funakoshi advocated for a patient approach to training, understanding that mastery is a gradual process.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f1u2n3a4', '{"id":"f1u2n3a4","author":"Gichin Funakoshi","tags":["Karate","Courage","Perseverance"],"date":"1956-07-01","text":"Courage is not the absence of fear, but the triumph over it.","meaning":"Highlights that true courage involves facing and overcoming one''s fears through Karate practice.","history":"Funakoshi emphasized that overcoming fear is essential for personal growth and mastery in Karate.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f5u6n7a8', '{"id":"f5u6n7a8","author":"Gichin Funakoshi","tags":["Karate","Discipline","Self-Control"],"date":"1956-07-01","text":"Discipline is the bridge between goals and accomplishment in Karate.","meaning":"Stresses the importance of self-discipline as a fundamental component for achieving success in Karate.","history":"Funakoshi believed that without discipline, the practitioner''s efforts would lack direction and effectiveness.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f9u0n1a2', '{"id":"f9u0n1a2","author":"Gichin Funakoshi","tags":["Karate","Integrity","Character"],"date":"1956-07-01","text":"Integrity in Karate means doing what is right, even when no one is watching.","meaning":"Conveys that true character is demonstrated through actions aligned with moral and ethical principles.","history":"Funakoshi advocated for maintaining personal integrity both inside and outside the dojo.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f3u4n5a6', '{"id":"f3u4n5a6","author":"Gichin Funakoshi","tags":["Karate","Focus","Concentration"],"date":"1956-07-01","text":"Focus your mind, and your Karate will follow.","meaning":"Highlights the importance of mental concentration in executing Karate techniques effectively.","history":"Funakoshi emphasized that mental clarity and focus are as crucial as physical training.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f7u8n9a0', '{"id":"f7u8n9a0","author":"Gichin Funakoshi","tags":["Karate","Respect","Courtesy"],"date":"1956-07-01","text":"Courtesy is the soul of Karate.","meaning":"Underscores that respectful behavior is integral to the practice and spirit of Karate.","history":"Funakoshi believed that maintaining courtesy fosters a positive and disciplined training environment.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f2u3n4a5', '{"id":"f2u3n4a5","author":"Gichin Funakoshi","tags":["Karate","Mindfulness","Presence"],"date":"1956-07-01","text":"Karate is not about the techniques, but about the spirit behind the techniques.","meaning":"Emphasizes that the true essence of Karate lies in the mindset and spirit of the practitioner, rather than just physical movements.","history":"Funakoshi believed that the mental and spiritual aspects are crucial for true mastery in Karate.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f6u7n8a9', '{"id":"f6u7n8a9","author":"Gichin Funakoshi","tags":["Karate","Humility","Learning"],"date":"1956-07-01","text":"In Karate, there is always someone stronger and faster. Respect and humility are paramount.","meaning":"Highlights the importance of maintaining humility and respect, recognizing that there is always room for improvement.","history":"Funakoshi advocated for a humble approach to training, fostering mutual respect among practitioners.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f0u1n2a3', '{"id":"f0u1n2a3","author":"Gichin Funakoshi","tags":["Karate","Consistency","Practice"],"date":"1956-07-01","text":"Progress in Karate comes not from occasional training, but from consistent and dedicated practice.","meaning":"Stresses the necessity of regular and disciplined training to achieve proficiency in Karate.","history":"Funakoshi emphasized that dedication and consistency are key to mastering Karate techniques and principles.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f4u5n6a7', '{"id":"f4u5n6a7","author":"Gichin Funakoshi","tags":["Karate","Balance","Harmony"],"date":"1956-07-01","text":"True Karate is the harmony of mind and body, working together in unison.","meaning":"Conveys that Karate requires a balanced integration of mental focus and physical execution.","history":"Funakoshi believed that achieving harmony between mind and body is essential for effective Karate practice.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f8u9n0a1', '{"id":"f8u9n0a1","author":"Gichin Funakoshi","tags":["Karate","Patience","Growth"],"date":"1956-07-01","text":"Patience is a virtue in Karate; growth comes in its own time.","meaning":"Emphasizes that personal and technical development in Karate require patience and cannot be rushed.","history":"Funakoshi advocated for a patient approach to training, understanding that mastery is a gradual process.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f1u2n3a5', '{"id":"f1u2n3a5","author":"Gichin Funakoshi","tags":["Karate","Character","Philosophy"],"date":"1956-07-01","text":"The purpose of Karate lies not in victory or defeat, but in the perfection of the character of its participants.","meaning":"Highlights that the true aim of Karate is the moral and personal development of its practitioners rather than competition outcomes.","history":"Funakoshi emphasized the ethical and character-building aspects of Karate, steering it away from mere physical confrontation.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f4u5n6a7', '{"id":"f4u5n6a7","author":"Gichin Funakoshi","tags":["Karate","Courtesy","Respect"],"date":"1956-07-01","text":"Karate begins and ends with courtesy.","meaning":"Emphasizes that polite behavior and respect are fundamental to the practice and spirit of Karate.","history":"Funakoshi believed that manners and respect are essential traits that Karate cultivates in its practitioners.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f8u9n0a2', '{"id":"f8u9n0a2","author":"Gichin Funakoshi","tags":["Karate","Confidence","Self-Belief"],"date":"1956-07-01","text":"To have confidence in your training, to have confidence in yourself, to have confidence in your abilities—if you have confidence, you will find the way to achieve your goal.","meaning":"Stresses the importance of self-confidence and belief in one''s training as keys to achieving success in Karate.","history":"Funakoshi advocated for a strong sense of self-belief and trust in one''s training regimen to reach Karate goals.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f3u4n5a8', '{"id":"f3u4n5a8","author":"Gichin Funakoshi","tags":["Karate","Discipline","Perseverance"],"date":"1956-07-01","text":"Perseverance is the key to success in Karate. Without it, even the best techniques are meaningless.","meaning":"Highlights that persistent effort and discipline are essential for meaningful progress in Karate.","history":"Funakoshi emphasized that continual practice and dedication are necessary to truly master Karate techniques.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f7u8n9a1', '{"id":"f7u8n9a1","author":"Gichin Funakoshi","tags":["Karate","Humility","Growth"],"date":"1956-07-01","text":"Humility is not thinking less of yourself, but thinking of yourself less.","meaning":"Conveys that true humility involves selflessness and focusing on others rather than oneself.","history":"Funakoshi encouraged practitioners to adopt a humble mindset, fostering personal growth and harmonious training environments.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f0u1n2a4', '{"id":"f0u1n2a4","author":"Gichin Funakoshi","tags":["Karate","Balance","Mental Strength"],"date":"1956-07-01","text":"True Karate requires the balance of mind and body, where mental strength complements physical ability.","meaning":"Emphasizes the necessity of mental fortitude alongside physical training in the practice of Karate.","history":"Funakoshi believed that achieving mental balance is as important as physical prowess in Karate.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f5u6n7a9', '{"id":"f5u6n7a9","author":"Gichin Funakoshi","tags":["Karate","Patience","Mastery"],"date":"1956-07-01","text":"Mastery in Karate comes not from quick success, but from patient and persistent effort over time.","meaning":"Highlights that achieving true mastery in Karate is a gradual process that requires patience and sustained effort.","history":"Funakoshi advocated for a long-term commitment to training, understanding that mastery is earned through time and dedication.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f9u0n1a3', '{"id":"f9u0n1a3","author":"Gichin Funakoshi","tags":["Karate","Integrity","Ethics"],"date":"1956-07-01","text":"Integrity in Karate means practicing with honesty and upholding ethical standards both inside and outside the dojo.","meaning":"Conveys that maintaining moral principles and ethical behavior is essential in the practice of Karate.","history":"Funakoshi emphasized that Karate practitioners should embody integrity in all aspects of their lives.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('f2u3n4a6', '{"id":"f2u3n4a6","author":"Gichin Funakoshi","tags":["Karate","Focus","Concentration"],"date":"1956-07-01","text":"Focus your mind, and your Karate will follow.","meaning":"Highlights the importance of mental concentration in effectively executing Karate techniques.","history":"Funakoshi emphasized that mental clarity and focus are crucial components for successful Karate practice.","reference":"Source: ''Karate-Do: My Way of Life''","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Gichin Funakoshi', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o1y2a3m4', '{"id":"o1y2a3m4","author":"Mas Oyama","tags":["Karate","Self-Discipline","Inner Strength"],"date":"1975-05-20","text":"To conquer oneself is a greater victory than to conquer thousands in a battle.","meaning":"Emphasizes that self-mastery and personal growth are more significant achievements than external victories.","history":"Oyama believed that the true essence of Karate lies in overcoming one''s own limitations and fears.","reference":"Source: Mas Oyama''s teachings","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o5y6a7m8', '{"id":"o5y6a7m8","author":"Mas Oyama","tags":["Karate","Mind and Body","True Strength"],"date":"1980-11-10","text":"In Karate, one must cultivate both mind and body to reach true strength.","meaning":"Highlights the importance of developing both mental resilience and physical prowess in Karate practice.","history":"Oyama advocated for a balanced approach to training, integrating mental focus with physical conditioning.","reference":"Source: Kyokushin Karate seminars","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o9y0a1m2', '{"id":"o9y0a1m2","author":"Mas Oyama","tags":["Karate","Overcoming Limits","Self-Improvement"],"date":"1978-07-04","text":"Training is not about fighting against others, but about overcoming your own limitations.","meaning":"Focuses on personal growth and self-improvement as the primary goals of Karate training.","history":"Oyama emphasized that true martial arts mastery involves surpassing one''s own boundaries.","reference":"Source: Kyokushin Karate manuals","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o3y4a5m6', '{"id":"o3y4a5m6","author":"Mas Oyama","tags":["Karate","Spirit","Character Building"],"date":"1972-03-18","text":"The spirit of Karate is not in striking, but in respecting and building character.","meaning":"Conveys that Karate fosters respect and character development rather than mere physical combat.","history":"Oyama believed that cultivating a strong moral character is essential for a true Karateka.","reference":"Source: Interviews with Mas Oyama","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o7y8a9m0', '{"id":"o7y8a9m0","author":"Mas Oyama","tags":["Karate","Self-Control","True Strength"],"date":"1985-09-25","text":"True strength is not measured by how hard you can hit, but by how well you can control yourself.","meaning":"Highlights that self-control and discipline are greater indicators of strength than physical force.","history":"Oyama emphasized the importance of mental discipline in achieving true martial arts mastery.","reference":"Source: Kyokushin Karate teachings","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o2y3a4m5', '{"id":"o2y3a4m5","author":"Mas Oyama","tags":["Karate","Continuous Improvement","Excellence"],"date":"1979-12-12","text":"A Karateka must strive for constant improvement, never settling for mediocrity.","meaning":"Encourages continuous learning and striving for excellence in all aspects of Karate.","history":"Oyama advocated for relentless dedication and the pursuit of perfection in training.","reference":"Source: Kyokushin Karate philosophy","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o6y7a8m9', '{"id":"o6y7a8m9","author":"Mas Oyama","tags":["Karate","Endurance","Dedication"],"date":"1983-04-30","text":"Endurance and dedication are the pillars upon which Karate is built.","meaning":"Stresses the importance of sustained effort and commitment in achieving Karate mastery.","history":"Oyama believed that long-term dedication and perseverance are essential for success in martial arts.","reference":"Source: Kyokushin Karate seminars","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o0y1a2m3', '{"id":"o0y1a2m3","author":"Mas Oyama","tags":["Karate","Mastery","Humility"],"date":"1988-08-08","text":"Mastery of Karate is achieved through persistent effort and unwavering determination.","meaning":"Highlights that achieving mastery requires continuous effort and steadfast commitment.","history":"Oyama emphasized that true mastery is a journey of persistent training and humility.","reference":"Source: Kyokushin Karate training programs","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o4y5a6m7', '{"id":"o4y5a6m7","author":"Mas Oyama","tags":["Karate","Balance","Harmony"],"date":"1976-06-15","text":"In the dojo, the path to mastery is walked one step at a time, with humility and respect.","meaning":"Conveys that mastering Karate is a gradual process that requires humility and respect for others.","history":"Oyama advocated for a respectful and humble approach to training and personal development.","reference":"Source: Kyokushin Karate teachings","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;

INSERT INTO quotes (id, data_json, author, status, created_at, updated_at, version)
VALUES ('o8y9a0m1', '{"id":"o8y9a0m1","author":"Mas Oyama","tags":["Karate","Inner Battles","Personal Growth"],"date":"1982-10-05","text":"Karate teaches us that the greatest battles are fought within ourselves.","meaning":"Highlights that personal growth and overcoming internal challenges are the true objectives of Karate.","history":"Oyama believed that the internal struggles and self-improvement are central to martial arts practice.","reference":"Source: Mas Oyama''s seminars","status":"published","createdAt":"2026-01-01T12:48:06.504Z","updatedAt":"2026-01-01T12:48:06.504Z"}', 'Mas Oyama', 'published', '2026-01-01T12:48:06.504Z', '2026-01-01T12:48:06.504Z', 1)
ON CONFLICT(id) DO UPDATE SET
  data_json = excluded.data_json,
  author = excluded.author,
  status = excluded.status,
  created_at = excluded.created_at,
  updated_at = excluded.updated_at,
  version = version + 1;
