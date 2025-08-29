// Bundle minimal pour test
(function() {
  console.log('Bundle chargé');
  
  // Créer les éléments DOM
  const app = document.createElement('div');
  app.style.height = '100%';
  app.style.display = 'flex';
  app.style.flexDirection = 'column';
  
  const header = document.createElement('div');
  header.style.backgroundColor = '#0084FF';
  header.style.color = 'white';
  header.style.padding = '20px';
  header.style.textAlign = 'center';
  
  const title = document.createElement('h1');
  title.textContent = 'Axiom App';
  title.style.margin = '0';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = 'Application de messagerie sécurisée';
  subtitle.style.margin = '5px 0 0';
  
  const content = document.createElement('div');
  content.style.flex = '1';
  content.style.padding = '20px';
  content.style.backgroundColor = '#f5f5f5';
  content.style.overflow = 'auto';
  
  const message = document.createElement('div');
  message.style.backgroundColor = 'white';
  message.style.padding = '20px';
  message.style.borderRadius = '8px';
  message.style.marginBottom = '10px';
  message.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
  
  const messageTitle = document.createElement('h2');
  messageTitle.textContent = 'Bienvenue sur Axiom App';
  messageTitle.style.margin = '0 0 10px';
  
  const messageContent = document.createElement('p');
  messageContent.textContent = 'Cette version web de l\'application est en cours de développement. Voici un aperçu des conversations :';
  
  // Créer une liste de conversations
  const conversations = [
    { name: 'Marie Dupont', message: 'Bonjour, comment vas-tu ?', time: '12:30' },
    { name: 'Jean Martin', message: 'As-tu reçu mon fichier ?', time: '11:15' },
    { name: 'Sophie Bernard', message: 'À quelle heure est la réunion demain ?', time: '10:45' }
  ];
  
  const list = document.createElement('div');
  list.style.marginTop = '20px';
  
  conversations.forEach(convo => {
    const item = document.createElement('div');
    item.style.backgroundColor = 'white';
    item.style.padding = '15px';
    item.style.marginBottom = '10px';
    item.style.borderRadius = '8px';
    item.style.display = 'flex';
    item.style.justifyContent = 'space-between';
    item.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
    item.style.cursor = 'pointer';
    
    item.addEventListener('click', function() {
      console.log('Conversation sélectionnée avec ' + convo.name);
      
      // Effet visuel de sélection
      const originalBackground = item.style.backgroundColor;
      item.style.backgroundColor = '#f0f8ff';
      setTimeout(() => {
        item.style.backgroundColor = originalBackground;
      }, 200);
      
      // On pourrait ici naviguer vers la conversation
      // window.location.href = '/conversation?id=' + encodeURIComponent(convo.name);
    });
    
    const left = document.createElement('div');
    
    const name = document.createElement('strong');
    name.textContent = convo.name;
    name.style.display = 'block';
    name.style.marginBottom = '5px';
    
    const msg = document.createElement('span');
    msg.textContent = convo.message;
    msg.style.color = '#666';
    
    left.appendChild(name);
    left.appendChild(msg);
    
    const time = document.createElement('span');
    time.textContent = convo.time;
    time.style.color = '#999';
    time.style.fontSize = '12px';
    
    item.appendChild(left);
    item.appendChild(time);
    
    list.appendChild(item);
  });
  
  const footer = document.createElement('div');
  footer.style.padding = '15px';
  footer.style.backgroundColor = 'white';
  footer.style.display = 'flex';
  footer.style.gap = '10px';
  
  const newConvoBtn = document.createElement('button');
  newConvoBtn.textContent = '+ Nouvelle conversation';
  newConvoBtn.style.flex = '1';
  newConvoBtn.style.padding = '12px';
  newConvoBtn.style.border = 'none';
  newConvoBtn.style.backgroundColor = '#0084FF';
  newConvoBtn.style.color = 'white';
  newConvoBtn.style.borderRadius = '5px';
  newConvoBtn.style.fontWeight = 'bold';
  newConvoBtn.style.cursor = 'pointer';
  
  newConvoBtn.addEventListener('click', function() {
    // Remplacer alert par une approche non-bloquante
    console.log('Nouvelle conversation initiée');
    
    // Ajouter un feedback visuel à l'utilisateur
    const toast = document.createElement('div');
    toast.textContent = 'Nouvelle conversation créée';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0,0,0,0.7)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 2000);
  });
  
  const settingsBtn = document.createElement('button');
  settingsBtn.textContent = '⚙️ Paramètres';
  settingsBtn.style.flex = '1';
  settingsBtn.style.padding = '12px';
  settingsBtn.style.border = 'none';
  settingsBtn.style.backgroundColor = '#f0f0f0';
  settingsBtn.style.borderRadius = '5px';
  settingsBtn.style.fontWeight = 'bold';
  settingsBtn.style.cursor = 'pointer';
  
  settingsBtn.addEventListener('click', function() {
    console.log('Paramètres sélectionnés');
    
    // Ajouter un feedback visuel à l'utilisateur
    const toast = document.createElement('div');
    toast.textContent = 'Paramètres ouverts';
    toast.style.position = 'fixed';
    toast.style.bottom = '20px';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'rgba(0,0,0,0.7)';
    toast.style.color = 'white';
    toast.style.padding = '10px 20px';
    toast.style.borderRadius = '5px';
    toast.style.zIndex = '1000';
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.5s';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 2000);
  });
  
  // Assembler l'interface
  header.appendChild(title);
  header.appendChild(subtitle);
  
  message.appendChild(messageTitle);
  message.appendChild(messageContent);
  
  content.appendChild(message);
  content.appendChild(list);
  
  footer.appendChild(newConvoBtn);
  footer.appendChild(settingsBtn);
  
  app.appendChild(header);
  app.appendChild(content);
  app.appendChild(footer);
  
  // Ajouter au DOM
  const root = document.getElementById('root');
  if (root) {
    root.appendChild(app);
    console.log('Application rendue avec succès');
  } else {
    console.error('Élément root non trouvé');
  }
})();
