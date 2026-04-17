const { randomUUID } = require('node:crypto');
const { Client } = require('pg');
const argon2 = require('argon2');

function getDatabaseUrl() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }
  throw new Error('DATABASE_URL is required in environment');
}

async function main() {
  const client = new Client({ connectionString: getDatabaseUrl() });
  await client.connect();

  try {
    await client.query('BEGIN');

    // Keep reruns clean: remove previous sample users only.
    await client.query(
      "DELETE FROM users WHERE email LIKE 'sample.user+%@example.com'",
    );

    const hashedPassword = await argon2.hash('password123');

    const users = Array.from({ length: 30 }, (_, i) => {
      const n = i + 1;
      return {
        id: randomUUID(),
        email: `sample.user+${n}@example.com`,
        password: hashedPassword,
        displayName: `Sample User ${n}`,
        subscriptionStatus: n % 3 === 0 ? 'PAID' : 'FREE',
      };
    });

    for (const user of users) {
      await client.query(
        `INSERT INTO users (id, email, password, display_name, subscription_status)
         VALUES ($1, $2, $3, $4, $5::"SubscriptionStatus")`,
        [
          user.id,
          user.email,
          user.password,
          user.displayName,
          user.subscriptionStatus,
        ],
      );
    }

    const prompts = users.map((u, i) => {
      const n = i + 1;
      return {
        id: randomUUID(),
        userId: u.id,
        text: `Sample prompt ${n}: cinematic lo-fi with soft piano`,
        status: 'COMPLETED',
      };
    });

    for (const prompt of prompts) {
      await client.query(
        `INSERT INTO prompts (id, user_id, text, status)
         VALUES ($1, $2, $3, $4::"PromptStatus")`,
        [prompt.id, prompt.userId, prompt.text, prompt.status],
      );
    }

    const audios = prompts.map((p, i) => {
      const n = i + 1;
      return {
        id: randomUUID(),
        promptId: p.id,
        userId: p.userId,
        title: `Generated Track ${n}`,
        url: `https://cdn.musicgpt.local/audio/sample-${n}.mp3`,
      };
    });

    for (const audio of audios) {
      await client.query(
        `INSERT INTO audios (id, prompt_id, user_id, title, url)
         VALUES ($1, $2, $3, $4, $5)`,
        [audio.id, audio.promptId, audio.userId, audio.title, audio.url],
      );
    }

    await client.query('COMMIT');

    console.log('Seed complete:');
    console.log(`- Users: ${users.length}`);
    console.log(`- Prompts: ${prompts.length}`);
    console.log(`- Audios: ${audios.length}`);
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
