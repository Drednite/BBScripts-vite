import { GangGenInfo, NS } from '@ns';

const TASK_TRAIN = 'Train Combat';
const TASK_VIGI = 'Vigilante Justice';
const TASK_NOOB = 'Mug People';
const TASK_RESPECT = 'Terrorism';
const TASK_MONEY = 'Human Trafficking';
const TASK_WARFARE = 'Territory Warfare';
const TASK_NULL = 'Unassigned';
const TASK_MANUAL = 'Manual/NotReallyTaskName';
const ASCEND_ON_MPL = 10;
const EQUIP_AFFORD_COEFF = 50;
const STATS_TRESHOLD = 0.7;
const STATS_MIN = 4000;
const STATS_HARD_MIN = 200;
const TRAIN_CHANCE = 0.2;
const RESPECT_MIN = 2e6;
const WANTED_PENALTY_TRESHOLD = 0.99;
const WARFARE_TRESHOLD = 2;
const MEMBERS_MIN = 6;
const MEMBERS_MAX = 12;
// const SLEEP_TIME = 10000;
/** @param {NS} ns **/
export async function main(ns: NS) {
  const gang = ns.gang;
  // Get weighted stats sum (at this moment, sum of combat stats in eq proportions)
  function getStatsSum(member: string) {
    const info = gang.getMemberInformation(member);
    return info.str + info.def + info.dex + info.agi;
  }
  // Find the best gang power except our gang
  function maxEnemyPower(myGang: GangGenInfo) {
    const others = ns.gang.getOtherGangInformation();
    let maxPower = 0;
    for (const name in others) {
      if (name === myGang.faction) continue;
      maxPower = Math.max(maxPower, others[name].power);
    }
    return maxPower;
  }
  // Set a task or not to set (if manually overridden)
  const autoTasks = new Map<string, string>([]);
  function setAutoTask(member: string, task: string) {
    const info = gang.getMemberInformation(member);
    const lastTask = info.task;
    // Manual task: stored task mismatches real task and not unassigned
    if (lastTask !== TASK_NULL && autoTasks.has(member) && autoTasks.get(member) !== lastTask) {
      autoTasks.set(member, TASK_MANUAL);
      return;
    }
    // Automatic task: set it if differs from real one
    autoTasks.set(member, task);
    if (lastTask !== task) {
      gang.setMemberTask(member, task);
    }
  }
  // The script accepts argument for default task override (optional)
  let defaultTask = null;
  if (ns.args[0] && gang.getTaskNames().includes(ns.args[0].toString())) {
    defaultTask = ns.args[0].toString();
  }
  // Main loop
  for (;;) {
    // Recruit any member possible
    while (gang.canRecruitMember()) {
      gang.recruitMember('member' + Math.random().toString().substr(2, 3));
    }
    let bestStats = STATS_MIN / STATS_TRESHOLD; // minimum
    const members = gang.getMemberNames();
    const info = gang.getGangInformation();
    // Ascend if good enough
    for (const member of members) {
      const r = gang.getAscensionResult(member);
      if (!r) continue;
      const mpl = r.agi * r.def * r.dex * r.str;
      if (mpl > ASCEND_ON_MPL) {
        gang.ascendMember(member);
        // ns.tprint(`Member ${member} ascended!`);
      }
    }
    // Purchase equipment
    const allEquip = gang.getEquipmentNames();
    let money = ns.getServerMoneyAvailable('home');
    for (const equip of allEquip) {
      const cost = gang.getEquipmentCost(equip);
      const amount = money / cost;
      if (amount < EQUIP_AFFORD_COEFF) continue;
      for (const member of members) {
        const info = gang.getMemberInformation(member);
        if (info.upgrades.includes(equip) || info.augmentations.includes(equip)) continue;
        if (gang.purchaseEquipment(member, equip)) {
          money -= cost;
        }
      }
    }
    // Find best stats
    for (const member of members) {
      const sum = getStatsSum(member);
      if (sum > bestStats) bestStats = sum;
    }
    // Check if we are powerful enough
    const powerfulEnough = info.power >= maxEnemyPower(info) * WARFARE_TRESHOLD;
    gang.setTerritoryWarfare(powerfulEnough);
    // Choose the default task for members
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let task = defaultTask!;
    if (!defaultTask) {
      // If gang isn't full - gain respect
      if (members.length < MEMBERS_MAX) {
        task = members.length < MEMBERS_MIN ? TASK_NOOB : TASK_RESPECT;
      } else {
        // if respect too low - gain it first, power second, money last
        if (info.respect < RESPECT_MIN) {
          task = TASK_RESPECT;
        } else if (!powerfulEnough) {
          task = TASK_WARFARE;
        } else {
          task = TASK_MONEY;
        }
      }
    }
    // Assign tasks
    for (const member of members) {
      const sum = getStatsSum(member);
      // Train members, not acceptable in 'noob mode'
      if (sum < STATS_HARD_MIN || (members.length >= MEMBERS_MIN && sum < bestStats * STATS_TRESHOLD)) {
        setAutoTask(member, TASK_TRAIN);
        continue;
      }
      // Vigi if wanted penalty too large
      if (info.wantedLevel > 2 && info.wantedPenalty < WANTED_PENALTY_TRESHOLD) {
        setAutoTask(member, TASK_VIGI);
        continue;
      }
      // Do the default task (autoselected or called with args[0])
      setAutoTask(member, Math.random() < TRAIN_CHANCE ? TASK_TRAIN : task);
    }
    await gang.nextUpdate();
  }
}
