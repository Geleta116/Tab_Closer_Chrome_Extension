document.addEventListener('DOMContentLoaded', () => {
    const tabList = document.getElementById('tab-list');
    const TWO_MINUTES = 2 * 60 * 1000; 
  
    chrome.tabs.query({}, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        return;
      }
  
      tabList.innerHTML = '';
      const now = Date.now();
  
      tabs.forEach(tab => {
        const lastAccessTime = tab.lastAccessed || tab.lastAccessTime || tab.lastAccessedTime; 
        const inactiveTime = now - new Date(lastAccessTime).getTime();
  
        if (inactiveTime > TWO_MINUTES) {
          chrome.tabs.remove(tab.id, () => {
            if (chrome.runtime.lastError) {
              console.error(chrome.runtime.lastError);
            }
          });
        } else {
          const listItem = document.createElement('li');
          listItem.className = 'flex items-center justify-between p-4 mb-2 bg-gray-100 border border-gray-200 rounded shadow-sm';
  
          const title = document.createElement('span');
          title.className = 'text-gray-800';
          title.textContent = `${tab.title} (Last accessed: ${formatTime(lastAccessTime)})`;
  
          const closeButton = document.createElement('button');
          closeButton.className = 'bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500';
          closeButton.textContent = 'Close';
          closeButton.addEventListener('click', () => {
            chrome.tabs.remove(tab.id, () => {
              if (chrome.runtime.lastError) {
                console.error(chrome.runtime.lastError);
              } else {
                listItem.remove();
              }
            });
          });
  
          listItem.appendChild(title);
          listItem.appendChild(closeButton);
          tabList.appendChild(listItem);
        }
      });
    });
  });
  
  function formatTime(timestamp) {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
  }
  