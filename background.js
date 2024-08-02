let tabAccessTimes = {};
let activeTabId = null;

chrome.tabs.onActivated.addListener((activeInfo) => {
    activeTabId = activeInfo.tabId; 
    tabAccessTimes[activeInfo.tabId] = Date.now();
});

chrome.tabs.onUpdated.addListener((tabId) => {
    tabAccessTimes[tabId] = Date.now();
});

const FIFTEEN_MINUTES = 15 * 60 * 1000;

function checkTabs() {
    chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
            return;
        }

        const now = Date.now();

        tabs.forEach(tab => {
            if (tab.id === activeTabId) {
                return;
            }

            const lastAccessTime = tabAccessTimes[tab.id];
            if (!lastAccessTime) {
                console.log(`Tab ${tab.id} does not have a last access time.`);
                return;
            }

            const inactiveTime = now - lastAccessTime;
            console.log(`Tab ${tab.id} inactive for ${inactiveTime} ms`);
            if (inactiveTime > FIFTEEN_MINUTES) {
                console.log(`Closing tab ${tab.id} due to inactivity.`);
                chrome.tabs.remove(tab.id, () => {
                    if (chrome.runtime.lastError) {
                        console.error(`Error closing tab ${tab.id}: ${chrome.runtime.lastError}`);
                    }
                });
            }
        });
    });
}

chrome.alarms.create("checkTabsAlarm", { periodInMinutes: 0.05 });

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "checkTabsAlarm") {
        checkTabs();
    }
});
