

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
              listItem.textContent = `${tab.title} (Last accessed: ${formatTime(lastAccessTime)})`;

              
              const closeButton = document.createElement('button');
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