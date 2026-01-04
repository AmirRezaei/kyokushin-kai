const fs = require('fs');
const crypto = require('crypto');

const mottos = [
  {
    id: 1,
    shortTitle: 'Courtesy',
    text: 'The Martial Arts begins and ends with courtesy. Therefore, be properly and genuinely courteous at all times.',
    details:
      "Courtesy is not merely a social nicety; it is the foundation upon which all martial arts training is built. Without courtesy, the dojo becomes a place of violence rather than learning. Genuine courtesy involves respect for one's instructors, seniors, peers, and oneself. It signifies a humble heart and an open mind, ready to receive instruction. In every bow, we acknowledge the value of the other person and check our own ego. This practice extends beyond the dojo into our daily lives, smoothing relationships and tempering aggression.",
  },
  {
    id: 2,
    shortTitle: 'Devotion',
    text: 'Following the Martial Way is like scaling a cliff – continue upwards without rest. It demands absolute and unfaltering devotion to the task at hand.',
    details:
      'The path of mastery is steep and arduous, much like climbing a sheer cliff face. There is no room for complacency; stopping effectively means sliding backward. Devotion here refers to a single-minded focus and an unyielding commitment to improvement. It is the grit required to show up even on days when the body is tired or the spirit is weak. This constant upward drive, despite obstacles, is what separates the true martial artist from the hobbyist.',
  },
  {
    id: 3,
    shortTitle: 'Initiative',
    text: 'Strive to seize the initiative in all things, always guarding against actions stemming from selfish animosity or thoughtlessness.',
    details:
      "Taking the initiative means acting with purpose and foresight rather than reacting to circumstances. In combat, this is 'Sen' – seizing the moment to control the opponent. In life, it means being proactive and responsible. However, this power must be tempered with wisdom. Initiative driven by anger ('selfish animosity') or lack of care ('thoughtlessness') leads to destruction. True initiative is constructive, born from a calm mind and a benevolent spirit.",
  },
  {
    id: 4,
    shortTitle: 'Detachment',
    text: 'Even for the Martial artist, the place of money cannot be ignored. Yet one should be careful never to become attached to it.',
    details:
      "Material resources are necessary for survival and can support one's training and community. Ignoring this reality is naive. However, the danger lies in attachment – when the pursuit of wealth overshadows the pursuit of character. When money becomes the master, the spirit is corrupted. A martial artist should view money as a tool, not a goal, maintaining a sense of detachment that allows them to remain free and unburdened by greed.",
  },
  {
    id: 5,
    shortTitle: 'Posture',
    text: 'The Martial Way is centred in posture. Strive to maintain correct posture at all times.',
    details:
      "Posture is more than just the alignment of the spine; it is the physical manifestation of one's state of mind. A strong, upright posture reflects confidence, alertness, and vitality. A slumped posture betrays fatigue or defeat. In technique, correct posture ensures balance, power generation, and efficiency. By maintaining correct posture at all times, we cultivate a spirit of readiness and dignity that permeates everything we do.",
  },
  {
    id: 6,
    shortTitle: 'Patience',
    text: 'The Martial Way begins with one thousand days and is mastered after ten thousand days of training.',
    details:
      "True skill cannot be rushed. 'One thousand days' represents roughly three years – the time it takes to build a solid foundation (often to black belt). 'Ten thousand days' represents thirty years – a lifetime of dedication required for mastery. This motto reminds us that there are no shortcuts. Patience is the ability to endure the monotony of repetition, knowing that every repetition is a step toward a distant but attainable peak.",
  },
  {
    id: 7,
    shortTitle: 'Wisdom',
    text: 'In the Martial Arts, introspection begets wisdom. Always see contemplation on your actions as an opportunity to improve.',
    details:
      "Physical training without mental reflection is merely exercise. Wisdom comes from looking inward (introspection). After every success and every failure, a martial artist asks, 'Why?' and 'How can I do better?'. This habit of self-contemplation turns every experience into a lesson. It prevents arrogance and ensures that we are constantly refining not just our technique, but our character.",
  },
  {
    id: 8,
    shortTitle: 'Purification',
    text: 'The nature and purpose of the Martial Way is universal. All selfish desires should be roasted in the tempering fires of hard training.',
    details:
      'Training is a forge. The intense heat of physical exertion and the pressure of combat serve to burn away the impurities of the self – ego, laziness, fear, and selfishness. What remains is a spirit that is pure, strong, and tempered like fine steel. This process of purification is the ultimate goal; the techniques are simply the hammer and anvil used to shape specific virtues.',
  },
  {
    id: 9,
    shortTitle: 'Principle',
    text: 'The Martial Arts begin with a point and end in a circle. Straight lines stem from this principle.',
    details:
      "This is a profound concept referring to the geometry of movement and combat. The 'point' is the focus, the origin. The 'circle' represents fluid, continuous movement and harmony. While straight lines (punches, kicks) are direct and efficient, they exist within the context of circular motion (blocking, evasion, turning). Mastery involves understanding how linear power emerges from circular flow, and how conflict can be resolved by blending (circle) rather than just crashing (point).",
  },
  {
    id: 10,
    shortTitle: 'Experience',
    text: 'The true essence of the Martial Way can only be realized through experience. Knowing this, learn never to fear its demands.',
    details:
      "You cannot learn martial arts fro a book or a video. Intellectual understanding is shallow; somatic (bodily) understanding is deep. You must feel the sweat, the fatigue, the fear, and the pain to truly 'know'. This motto encourages us to embrace the hardships of training ('its demands') because they are the only vehicle for true realization. Fear of difficulty freezes growth; embracing difficulty accelerates it.",
  },
  {
    id: 11,
    shortTitle: 'Gratitude',
    text: 'Always remember: In the Martial Arts the rewards for a confident and grateful heart are truly abundant.',
    details:
      "Gratitude turns what we have into enough. A martial artist who is grateful for their teachers, training partners, and even their opponents finds joy in the journey. This positive mindset fosters confidence, which in turn attracts success and opportunities. A bitter or entitled heart closes one off from learning. An open, grateful heart receives the 'abundant rewards' of friendship, health, and spiritual growth.",
  },
];

const sql = mottos
  .map((m) => {
    const id = crypto.randomUUID();
    // Ensure we consistently use this ID in the json as well
    const dataObj = { ...m, id: id };
    // Remove the old numeric id if we want purely uuid, or keep it as 'order'?
    // Let's remove numeric ID to avoid confusion or keep it as 'sequence' if needed?
    // The user prompt implied migrating, so let's stick to the new ID system.
    delete dataObj.id;

    const data = JSON.stringify(dataObj);
    const escapedData = data.replace(/'/g, "''");
    return `INSERT INTO mottos (id, data_json, status, created_at, updated_at, version) VALUES ('${id}', '${escapedData}', 'published', strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), 1);`;
  })
  .join('\n');

const output = '-- file: scripts/seed_mottos.sql\n' + 'DELETE FROM mottos;\n' + sql;

fs.writeFileSync('scripts/seed_mottos.sql', output);
console.log('Generated scripts/seed_mottos.sql');
