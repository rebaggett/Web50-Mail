document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', () => compose_email());

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email(recipient = '', subject = '', timestamp = '', body = '') {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Run send_mail function when submit button is clicked
  document.querySelector('#compose-submit').addEventListener('click', send_mail);

  // If reply, add formatting  to subject and body
  if (subject !== '') {
    if (subject.slice(0,3) != 'RE:') {
      subject = 'RE: ' + subject;
    }
    body = `\n \n --- On ${timestamp} ${recipient} wrote: --- \n${body}`;
  }

  // Clear or auto-populate fields
  document.querySelector('#compose-recipients').value = recipient;
  document.querySelector('#compose-subject').value = subject;
  document.querySelector('#compose-body').value = body;
  
}

function load_mailbox(mailbox) {
  console.log(mailbox);
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#detail-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  const mailboxDiv = document.querySelector('#emails-view');
  mailboxDiv.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Load the appropriate emails
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

    // Print emails
    console.log(emails);

    // Create email table and append to mailbox div
    const emailTable = document.createElement('table');
    emailTable.id = 'email-table'
    mailboxDiv.append(emailTable);
    
    for (const email of emails) {

      // Create elements for each email and its contents
      const emailItem = document.createElement('tr');
      const sender = document.createElement('td');
      const subject = document.createElement('td');
      const timestamp = document.createElement('td');
      
      // Add class to row, if email is read, color in grey
      emailItem.classList.add('table-row');
      if (email.read) {
        emailItem.classList.add('email-read')
      }
      
      // Add content to each cell
      sender.innerHTML = email.sender;
      subject.innerHTML = email.subject;
      timestamp.innerHTML = email.timestamp;
      
      // Add classes to each cell
      sender.classList.add('table-detail', 'table-sender');
      subject.classList.add('table-detail', 'table-subject')
      timestamp.classList.add('table-detail', 'table-timestamp');
      
      
      // Add click function to cells
      const clickToOpen = [sender, subject, timestamp];
      clickToOpen.forEach(element => element.addEventListener('click', ()=> view_email(email.id)));
      
      // If inbox or archive, add archive functionality
      if (mailbox === 'inbox' || mailbox === 'archive') {
        const archive = document.createElement('td');
        archive.classList.add('table-detail', 'table-archive');
        archive.addEventListener('click', ()=> archive_email(email));
        const archiveHelp = document.createElement('span');
        archiveHelp.classList.add('table-archive-text');

        // If inbox add Archive text
        if (mailbox === 'inbox'){
          archiveHelp.innerHTML = 'Archive';
        }
        // If archive add Unarchive text
        else{
          archiveHelp.innerHTML = 'Unarchive';
        }
        archive.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-archive" viewBox="0 0 16 16"><path d="M0 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1v7.5a2.5 2.5 0 0 1-2.5 2.5h-9A2.5 2.5 0 0 1 1 12.5V5a1 1 0 0 1-1-1V2zm2 3v7.5A1.5 1.5 0 0 0 3.5 14h9a1.5 1.5 0 0 0 1.5-1.5V5H2zm13-3H1v2h14V2zM5 7.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5z"/> </svg>';
        archive.appendChild(archiveHelp);
        emailItem.appendChild(archive);
      }

      // Add cells to row, add row to table
      emailItem.appendChild(sender);
      emailItem.appendChild(subject);
      emailItem.appendChild(timestamp);
      emailTable.appendChild(emailItem);
      console.log(emailTable)
    }

  })
}

function send_mail() {
    fetch ('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: document.querySelector('#compose-recipients').value, 
        subject: document.querySelector('#compose-subject').value,
        body: document.querySelector('#compose-body').value
      })
    })
    .then(()=>load_mailbox('sent'));
}

function view_email(id) {

  // Clear previous emails
  const viewDiv = document.querySelector('#detail-view');
  while(viewDiv.lastChild) {
    viewDiv.removeChild(viewDiv.lastChild);
  }

  // Hide other components on page
  document.querySelector('#emails-view').style.display = 'none';
  viewDiv.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // GET promise for email with entered id
  fetch (`/emails/${id}`)
  .then(response => response.json())
  .then(email => {

    // Print email
    console.log(email);

    // Initialize DOM elements
    const metadata = document.createElement('div');
    const from = document.createElement('p');
    const to = document.createElement('p');
    const subject = document.createElement('p');
    const timestamp = document.createElement('p');
    const reply = document.createElement('button');
    const body = document.createElement('p');

    // Set classes and IDs
    metadata.setAttribute('id', 'view-metadata');
    from.setAttribute('id', 'view-from');
    to.setAttribute('id', 'view-to');
    subject.setAttribute('id', 'view-subject');
    timestamp.setAttribute('id', 'view-timestamp');
    body.setAttribute('id', 'view-body');
    reply.classList.add('btn', 'btn-sm', 'btn-outline-primary');

    // Add data to elements
    from.innerHTML = '<span class="view-metadata-bold">From: </span>' + email.sender;
    to.innerHTML = '<span class="view-metadata-bold">To: </span>' + email.recipients;
    subject.innerHTML = '<span class="view-metadata-bold">Subject: </span>' + email.subject;
    timestamp.innerHTML = '<span class="view-metadata-bold">Timestamp: </span>' + email.timestamp;
    reply.innerHTML = 'Reply';
    body.innerHTML = email.body;

    // Add action to button
    reply.addEventListener('click', () => compose_email(email.sender, email.subject, email.timestamp, email.body));

    // Add elements to DOM
    metadata.appendChild(from);
    metadata.appendChild(to);
    metadata.appendChild(subject);
    metadata.appendChild(timestamp);
    metadata.appendChild(reply);
    viewDiv.appendChild(metadata);
    viewDiv.appendChild(body);

    if (!email.read) {
      fetch(`/emails/${id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read:true
        })
      })
    }

  })

}

function archive_email(email) {

  console.log(email);

  // If the email is not archived, archive it
  if (email.archived === false) {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: true
    })
    })
    .then(()=>load_mailbox('inbox'));
  // Else unarchive it
  } else {
    fetch(`/emails/${email.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: false
      })
    })
    .then(()=>load_mailbox('inbox'));
  }
}