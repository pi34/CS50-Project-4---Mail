document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  document.querySelector('#form').onsubmit = () => {
    const recipient = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    send_email(recipient, subject, body)

    load_mailbox('sent');

  }
  
});

function load_content(email_id, status, recipient, sender, subject, body, timestamp) {
  document.querySelector('#content-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';

  get_email(email_id);

  if (status === true) {
    document.querySelector('#archive').innerHTML = "Unarchive"
  } else {
    document.querySelector('#archive').innerHTML = "Archive"
  }

  document.querySelector('#reply').addEventListener('click', () => {
    reply(timestamp, recipient, sender, subject, body)
  })

  document.querySelector('#archive').addEventListener('click', () => {
    if (status === true) {
      fetch(`emails/${email_id}`, {
        method: 'PUT',
        body: JSON.stringify({
          archived: false
        })
      })
      
    } else {
      fetch(`emails/${email_id}`, {
        method: 'PUT', 
        body: JSON.stringify({
          archived: true
        })
      })
    }
    load_mailbox('inbox')
  })
  
}

function get_email(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(result => {
    document.querySelector('#sender').innerHTML = `<h6><strong>From: </strong>${result.sender}</h6>`
    document.querySelector('#recipient').innerHTML = `<h6><strong>To: </strong>${result.recipients}</h6>`
    document.querySelector('#subject').innerHTML = `<h6><strong>Subject: </strong>${result.subject}</h6>`
    document.querySelector('#timestamp').innerHTML = `<h6><strong>Timestamp: </strong>${result.timestamp}</h6>`
    document.querySelector('#body').innerHTML = `<p>${result.body}</p>`
  })
  fetch(`/emails/${id}`, {
    method:'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#content-view').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').disabled = false;
  document.querySelector('#compose-subject').disabled = false;
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#content-view').style.display = 'none';
  
  if (mailbox === 'sent') {
    document.querySelector('#archive').style.display = 'none'
  }

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  const table = document.createElement('table')
  document.querySelector('#emails-view').append(table)
  table.id = 'emails'

  // Load mailbox content
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(mails => {
    mails.forEach(element => {
      let email = document.createElement('tr')
      if (mailbox === 'sent') {
        email.innerHTML = `<td><h5>To: ${element.recipients}</h5></td><td> ${element.subject}</td><td>${element.timestamp}</td>`
      } else {
        email.innerHTML = `<td><h5>${element.sender}</h5></td><td> ${element.subject}</td><td>${element.timestamp}</td>`
      }
      if (element.read) {
        email.style.backgroundColor = "rgb(221, 221, 221)"
      }
      
      email.addEventListener('click', function() {
        load_content(element.id, element.archived, element.sender, element.recipients, element.subject, element.body, element.timestamp)       
      })
      document.querySelector('#emails').append(email)
    });
  })
}

function send_email(recipient, subject, body) {
  console.log("Message sent!")
  fetch('/emails', {
    method: 'POST', 
    body: JSON.stringify({
      recipients: recipient, 
      subject: subject, 
      body: body
    })
  })
  .then (response => response.json())
  .then (result => {
    alert(result.message)
  })
}

function reply(timestamp, recipient, sender, subject, body) {
  compose_email()
  if (recipient === document.querySelector('#compose-sender').value) {
    document.querySelector('#compose-recipients').value = sender
  } else {
    document.querySelector('#compose-recipients').value = recipient;
  }
  document.querySelector('#compose-recipients').disabled = true;
  document.querySelector('#compose-subject').disabled = true

  let string = subject.substring(0, 3)
   if (string === 'Re:') {
    document.querySelector('#compose-subject').value = subject;
  } else {
    document.querySelector('#compose-subject').value = `Re: ${subject}`;
  }
    
  document.querySelector('#compose-body').value = `On ${timestamp} ${recipient} wrote:\n\n${body}`;

}