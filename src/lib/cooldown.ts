"use server";

import { usersCollection } from './db';
import { COOLDOWN_INTERVAL } from './types';

/**
 * Gets the time at which the pixel cooldown ends for a user. Returns Date.now() if no cooldwown exists.
 * @param username The user to check the cooldown for
 * @returns An epoch time
 */
export async function getPixelCooldownEnd(username: string) {
  const cooldown = await usersCollection.findOne({ id: username });

  if (!cooldown) {
    return Date.now();
  }

  return cooldown.pixelCooldownEnd;
}

export async function resetPixelCooldown(username: string) {
  // Update database
  const cooldownEnd = Date.now() + COOLDOWN_INTERVAL;
  await usersCollection.updateOne(
      { id: username },
      { $set: { pixelCooldownEnd: cooldownEnd } },
      { upsert: true }
  );
  return cooldownEnd;
}
