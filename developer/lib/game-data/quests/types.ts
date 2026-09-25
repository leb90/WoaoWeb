/** Quest domain types — mirror server/jsons/quests.json */

export type QuestRequirement = {
  index: number;
  amount: number;
};

export type QuestData = {
  id: number;
  name: string;
  desc: string;
  requiredLevel: number;
  repeatable?: boolean;
  requiredNpcs: QuestRequirement[];
  requiredObjs: QuestRequirement[];
  rewardGold: number;
  rewardExp: number;
  rewardPoints: number;
  rewardObjs: QuestRequirement[];
  [key: string]: unknown;
};

export type QuestsFile = Record<string, QuestData>;
export type QuestGiversFile = Record<string, number>;

export type QuestGiverInfo = {
  npcId: number;
  name: string;
  idBody: number;
  idHead: number;
  npcType: number;
};

export type QuestMapLocation = {
  mapId: number;
  x: number;
  y: number;
  href: string;
};

export type QuestListItem = {
  id: number;
  name: string;
  desc: string;
  repeatable: boolean;
  requiredLevel: number;
  objectivesLabel: string;
  rewardsLabel: string;
  giver: QuestGiverInfo | null;
  givers: QuestGiverInfo[];
  locations: QuestMapLocation[];
  requiredNpcs: QuestRequirement[];
  requiredObjs: QuestRequirement[];
  rewardGold: number;
  rewardExp: number;
  rewardPoints: number;
  rewardObjs: QuestRequirement[];
};

export type QuestNpcDraft = {
  name: string;
  npcType?: number;
  idBody?: number;
  idHead?: number;
  desc?: string;
};

export type AssignNpcMode = "none" | "existing" | "create";
