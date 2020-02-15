$(function(){

const user_input_departure = $("#departure-airport")
const user_input_arrival = $("#arrival-airport")
const search_icon = $('#search-icon') // this is the heading in h3 i.e. Ticket Info
const airports_div_departure = $('#departure-airport-search-result') 
const airports_div_arrival = $('#arrival-airport-search-result') 
const demanded_users = $('#demanded-users')
const endpoint_departure = '/airports_departure/' 
const endpoint_arrival = '/airports_arrival/' 

const delay_by_in_ms = 100
let scheduled_function = false

const divCurrentUserAllTickets = $('#divCurrentUserAllTickets');
const divAllDemandedUserTickets = $('#divAllDemandedUserTickets');

$(document).ready(function(){
			// Retrieve the object from storage
			var retrievedObject = JSON.parse(localStorage.getItem('ticket-data'));
			if(retrievedObject==null)
				return;

			// console.log('retrievedObject: ', retrievedObject);
			// console.log(retrievedObject.departure_airport);
			$('#departure-airport').val(retrievedObject.departure_airport);
			$('#arrival-airport').val(retrievedObject.arrival_airport);
			$('#flight-number').val(retrievedObject.flight_number);
			$('#departure-date').val(retrievedObject["date"]);
			$('#departure-time').val(retrievedObject["time"]);
			$('#is-giver').val(retrievedObject["is_giver"]);

	// when user logs in, change all values in local storage to empty		
	let is_user_loggedin = $('#is-user-loggedin').text()
		console.log(is_user_loggedin)
		if(is_user_loggedin === 'True')
		{
				var ticketData = {
				"departure_airport":"",
				"arrival_airport":"",
				"flight_number":"",
				"date": "",
				"time": "00:00",
				"is_giver":""
			};
		localStorage.setItem('ticket-data',  JSON.stringify(ticketData));
	}

});


let ajax_call_arrival = function (endpoint_arrival, request_parameters) {
	$.getJSON(endpoint_arrival, request_parameters)
		.done(response => {
			// fade out the airports_div, then:
			airports_div_arrival.fadeTo('slow', 0).promise().then(() => {
				// replace the HTML contents
				airports_div_arrival.html(response['html_from_view'])
				// fade-in the div with new contents
				airports_div_arrival.fadeTo('slow', 1)
				// stop animating search icon
				search_icon.removeClass('blink')
			})
		})
}

function delay(callback, ms) {
  var timer = 0;
  return function() {
    var context = this, args = arguments;
    clearTimeout(timer);
    timer = setTimeout(function () {
      callback.apply(context, args);
    }, ms || 0);
  };
}

$('#arrival-airport').keyup(delay(function (e) {
	console.log("user input arrived");
	const request_parameters = {
		q: $(this).val() // value of user_input: the HTML element with ID user-input
	}
	// makes sure that users type 3 characters to make query search
	// if($(this).val().length<3)
	// 	return;
	// start animating the search icon with the CSS class
	search_icon.addClass('blink')

	// if scheduled_function is NOT false, cancel the execution of the function
	if (scheduled_function) {
		clearTimeout(scheduled_function)
	}

	// setTimeout returns the ID of the function to be executed
	scheduled_function = setTimeout(ajax_call_arrival, delay_by_in_ms, endpoint_arrival, request_parameters)

	}, 30)); //adds delay of 300 ms


// demanded-users: it is the id of the <div> element in the base.html file where demandec_users.html file is included
demanded_users.click(function(e) {
		// console.log(e.target.id);
		// button id is coded using ticket author id and ticket author username
		// problem here is that anything other fields are not accessible from base.html
		let str = e.target.id.split('-');
		let other_userid = str[2];
		let other_username = str[3];
		// console.log($('#hidden-this-username').val());
		// console.log($('#hidden-this-userid').val());
		// console.log(other_userid);
		// console.log(other_username);

	openForm($('#hidden-this-userid').val(), other_userid, $('#hidden-this-username').val(), other_username);

});


$("#currentUserTicketList li").click(function(e) {
			//console.log(e.target.id);

   			// only if button is clicked
   			if(e.target.id === 'idProducerConsumer'){
   				$.ajax({
					url: '/find-all-matched-users/', //ajax call will be made to this url
					type: 'get',
					data:{
						ticket_id:$(this).find('#hidden-current-user-ticket-id').text(),
					},
					dataType: "json",
					success: function(response){
						// alert("Successful!");
						// console.log(response['html_from_view']);
						demanded_users.html(response['html_from_view']);
						divCurrentUserAllTickets.html("");
						//console.log($('#divAllDemandedUserTickets').html());
					}
				});
   			}
   			
});



// Add event for selecting the ticket pdf
// $('input[type=file]').on('change', prepareUpload);

// // Grab the files and set them to our variable
// ticket_file_name=""
// function prepareUpload(event)
// {
//   ticket_file_name = event.target.files;
// }

$(document).on('submit', '#ticket-info-form', function(e){
	e.preventDefault(); // this prevents from refreshing the page
	let is_user_loggedin = $('#is-user-loggedin').text()
	console.log(is_user_loggedin)
	if(is_user_loggedin === 'False')
	{
		var ticketData = {
				"departure_airport":$('#departure-airport').val(),
				"arrival_airport":$('#arrival-airport').val(),
				"flight_number":$('#flight-number').val(),
				"date":$('#departure-date').val(),
				"time":$('#departure-time').val(),
				"is_giver":$('#is-giver').val()
			};

		// Put the object into storage
		localStorage.setItem('ticket-data', JSON.stringify(ticketData));

		// simulate a page redirect
		window.location.replace("http://localhost:8000/login/");
		return;
	}

	$.ajax({
			url: '/create/new/ticket/', //ajax call will be made to this url
			type: 'post',
			data:{
				departure_airport:$('#departure-airport').val(),
				arrival_airport:$('#arrival-airport').val(),
				flight_number:$('#flight-number').val(),
				date:$('#departure-date').val(),
				time:$('#departure-time').val(),
				is_giver:$('#is-giver').val(),
				// ticket_pdf:$('#ticket-pdf').val()
				csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val()
			},
			// contentType: false,
   //      	processData: false,
        	enctype: 'multipart/form-data',
			dataType: "json",
			success: function(response){
				// alert("Successful!");
				$("#ticket-info-form").trigger('reset');//clear the form
				demanded_users.html(response['html_from_view']);
				divCurrentUserAllTickets.html("");
			}
		});
});


let ajax_call_departure = function (endpoint_departure, request_parameters) {
	$.getJSON(endpoint_departure, request_parameters)
		.done(response => {
			// fade out the airports_div, then:
			airports_div_departure.fadeTo('slow', 0).promise().then(() => {
				// replace the HTML contents
				airports_div_departure.html(response['html_from_view'])
				// fade-in the div with new contents
				airports_div_departure.fadeTo('slow', 1)
				// stop animating search icon
				search_icon.removeClass('blink')
			})
		})
}


user_input_departure.on('keyup', function () {

	const request_parameters = {
		q: $(this).val() // value of user_input: the HTML element with ID user-input
	}

	// start animating the search icon with the CSS class
	search_icon.addClass('blink')

	// if scheduled_function is NOT false, cancel the execution of the function
	if (scheduled_function) {
		clearTimeout(scheduled_function)
	}

	// setTimeout returns the ID of the function to be executed
	scheduled_function = setTimeout(ajax_call_departure, delay_by_in_ms, endpoint_departure, request_parameters)
})

/////////////////////////// FIREBASE ///////////////////////////////////

		const allRooms = firebase.database().ref().child('allRooms');
	    const allChatsPerUser = firebase.database().ref().child('allChatsPerUser'); // all chats for each user id
        // on page load, chat form should not appear. It should appear only on "Chat Now" clicked
        document.getElementById("myForm").style.display = "none";
        let roomName = "000";
        let g_this_user = "";
        let g_other_user = "";
        let number_of_messages_to_load = 0;
        let active_room = "NA";
        let isTicketForm = "True";


        $('#idCloseChatButton').on('click', closeForm);
        $('#chat-message-submit').on('click', sendMessage);

	    function openForm(first, second, this_user, other_user) {
	      number_of_messages_to_load = 30;
	      g_this_user = this_user;
	      g_other_user = other_user;
	      if(isNaN(second))
	      {
	      	return;
	      }
	      console.log(first);
	      console.log(second);	      
	      first = parseInt(first);
	      second = parseInt(second);
		  if(first < second)
		  	roomName = first*1000000000000+second;
		  else
		  	roomName = second*1000000000000+first;
		  active_room = roomName;
		  console.log(roomName);
		  document.getElementById("other-user").innerHTML = other_user;
		  document.getElementById("myForm").style.display = "block";

		    // load all previous messages
		    let chat = document.getElementById('chat-log');
		    let str = Object.assign("", chat.innerHTML);
		    chat.innerHTML = "";
		    let last_message = "";
		    let last_message_timestamp = "";
		    // check if roomName exists na
        	allRooms.child(roomName).orderByKey().limitToLast(number_of_messages_to_load).on('value', snapshot => {
			    // console.log(snapshot.val());
			    let str_temp="";
			    console.log(number_of_messages_to_load);
			    let last_message_sender = g_this_user;
			    snapshot.forEach((messageSnapshot) => {
			      // console.log(messageSnapshot.key);
			      // console.log(messageSnapshot.val().message);
			      // console.log("loop length");
			      last_message_sender = messageSnapshot.val().sender;
			      if(messageSnapshot.val().sender === g_this_user)
			      	str_temp += '<div align="right"><span style="background: #96b5e0; border-color: #e1eaf7;  border-radius: 25px;">'+messageSnapshot.val().message+'</span></div>';
			      else if(messageSnapshot.val().sender === g_other_user)
			      	str_temp += '<div align="left"><span style="border-color: #e1eaf7;  border-radius: 25px;">'+messageSnapshot.val().message+'</span></div>';
			      last_message = messageSnapshot.val().message;
			      last_message_timestamp = messageSnapshot.val().time;
			    });
			    if(last_message_sender === g_this_user){
			    	if(g_other_user === undefined)
			    		return;
			    	  allChatsPerUser.child(g_other_user).child(roomName).on('value', snapshot => {
					      // console.log(snapshot.val());
					      snapshot.forEach((messageSnapshot) => {
					      	if(messageSnapshot.key === "unread_message_count")
					      	{
					      	  console.log("unread: "+messageSnapshot.val());
					    	  if(parseInt(messageSnapshot.val()) > 0)
					    	  	$('#idSeenNotSeen').html("not seen");
						  	  else if(parseInt(messageSnapshot.val()) === 0)
							  	$('#idSeenNotSeen').html("seen");
							  else
							  	$('#idSeenNotSeen').html("");
							}
				         });
			         });
			    }
			    else{
			    	$('#idSeenNotSeen').html("");
			    }
			    chat.innerHTML = str_temp;
			    //scroll to bottom of the chat
			    var e = document.getElementById('div-messages');
				e.scrollTop = e.scrollHeight;
			    // console.log(str_temp);
			    // update the seen status of the clicked chat
			    if(active_room !== "NA"){
			    	allChatsPerUser.child(g_this_user).child(active_room).set({
					last_message: last_message,
					other_user: g_other_user,
					last_message_timestamp: last_message_timestamp,
					unread_message_count: 0,
				});	
			    }
		  });
		}

		function openForm_with_roomId(roomName, this_user, other_user) {
	    	number_of_messages_to_load = 30;
	    	g_this_user = this_user;
	    	g_other_user = other_user;
	    	active_room = roomName;
	      // console.log(other_user);
		  console.log(roomName);
		  document.getElementById("other-user").innerHTML = other_user;
		  document.getElementById("myForm").style.display = "block";

		    // load all previous messages
		    let chat = document.getElementById('chat-log');
		    chat.innerHTML = "";
		    let last_message = "";
		    let last_message_timestamp = "";
		    // check if roomName exists na
        	allRooms.child(roomName).orderByKey().limitToLast(number_of_messages_to_load).on('value', snapshot => {
			    // console.log(snapshot.val());
			    let str_temp="";
			    console.log(number_of_messages_to_load);
			    let last_message_sender = g_this_user;
			    snapshot.forEach((messageSnapshot) => {
			      // console.log(messageSnapshot.key);
			      // console.log(messageSnapshot.val().message);
			      // console.log("loop length");
			      last_message_sender = messageSnapshot.val().sender;
			      if(messageSnapshot.val().sender === this_user)
			      	str_temp += '<div align="right"><span style="background: #96b5e0; border-color: #e1eaf7;  border-radius: 25px;">'+messageSnapshot.val().message+'</span></div>';
			      else
			      	str_temp += '<div align="left"><span style="border-color: #e1eaf7;  border-radius: 25px;">'+messageSnapshot.val().message+'</span></div>';
			        // console.log(g_this_user);
			        last_message = messageSnapshot.val().message;
			        last_message_timestamp = messageSnapshot.val().time;
			    });
			    if(last_message_sender === g_this_user){
			    	  allChatsPerUser.child(g_other_user).child(roomName).on('value', snapshot => {
					      // console.log(snapshot.val());
					      snapshot.forEach((messageSnapshot) => {
					      	if(messageSnapshot.key === "unread_message_count")
					      	{
					      	  console.log("unread: "+messageSnapshot.val());
					    	  if(parseInt(messageSnapshot.val()) > 0)
					    	  	$('#idSeenNotSeen').html("not seen");
						  	  else if(parseInt(messageSnapshot.val()) === 0)
							  	$('#idSeenNotSeen').html("seen");
							  else
							  	$('#idSeenNotSeen').html("");
							}
				         });
			         });
			    }
			    else
			    {
			    	$('#idSeenNotSeen').html("");
			    }
			    chat.innerHTML = str_temp;
			    //scroll to bottom of the chat
			    var e = document.getElementById('div-messages');
				e.scrollTop = e.scrollHeight;
			    // console.log(str_temp);
			    // update the seen status of the clicked chat
			    if(active_room !== "NA"){
			    	allChatsPerUser.child(g_this_user).child(active_room).set({
					last_message: last_message,
					other_user: g_other_user,
					last_message_timestamp: last_message_timestamp,
					unread_message_count: 0,
				  });		
			    }
		  });
		}


		function closeForm() {
			active_room = "NA";
		    document.getElementById("myForm").style.display = "none";
		} 
		window.onload = function(){
			closeForm();
		} 

		document.getElementById('chat-message-input').onkeyup = function(e) {
            if (e.keyCode === 13) {  // enter, return
                document.getElementById('chat-message-submit').click();
                // console.log("pressed...");
            }
        };

        function sendMessage(){
        	console.log("Send message called");
        	number_of_messages_to_load = 1;
        	let time = new Date().getTime(); // in milliseconds
        	let msg = document.getElementById("chat-message-input").value;
        	document.getElementById("chat-message-input").value="";

        	allRooms.child(roomName).push({
        		sender: g_this_user,
        		message: msg,
        		time: time
        	});
        	allChatsPerUser.child(g_this_user).child(roomName).set({
				last_message: msg,
				other_user: g_other_user,
				last_message_timestamp: new Date().getTime()+"",
				unread_message_count: 0,
			});
		    allChatsPerUser.child(g_other_user).child(roomName).set({
				last_message: msg,
				other_user: g_this_user,
				last_message_timestamp: new Date().getTime()+"",
				unread_message_count: 1,
			});
			allChatsPerUser.child(g_other_user).child(roomName).on('value', snapshot => {
			      // console.log(snapshot.val());
			      let sender = g_this_user;
			      let unread_message_count = 1;
			      snapshot.forEach((messageSnapshot) => {
			      	if(messageSnapshot.key === "unread_message_count")
			      	{
			      	  unread_message_count = messageSnapshot.val()
			      	  console.log("unread: "+messageSnapshot.val());
					}
			      });

			    allRooms.child(roomName).orderByKey().limitToLast(1).on('value', snapshot => {
				    // console.log(snapshot.val());
				    snapshot.forEach((messageSnapshot) => {
				    	sender = messageSnapshot.val().sender;
				    });
				});
				if(unread_message_count > 0 && sender===g_this_user)
			    	$('#idSeenNotSeen').html("not seen");
				else if(unread_message_count === 0 && sender===g_this_user)
					$('#idSeenNotSeen').html("seen");
			    else
					$('#idSeenNotSeen').html("");
			});
        	// console.log(g_other_user);
        }

        $('#div-all-chats').click(function() {
			// console.log("hello world!");
			// console.log($('#hidden-this-username').val());
			// console.log($('#hidden-this-userid').val());
			if(isTicketForm === "True")
			{
				isTicketForm = "False";
				allChatsPerUser.child($('#hidden-this-username').val()).on('value', snapshot => {
			    // console.log(snapshot.val());
			    temp_all_chats = "";
			    snapshot.forEach((messageSnapshot) => {
			    	let other_user = messageSnapshot.val().other_user;
			    	let last_message = messageSnapshot.val().last_message;
			    	let last_message_timestamp = messageSnapshot.val().last_message_timestamp;
			    	let roomName = messageSnapshot.key;
			    	let unread_message_count = messageSnapshot.val().unread_message_count;
			      	// console.log(sender, last_message);
			      	let temp="";
			      	if(parseInt(unread_message_count) > 0)
					{
						temp = '<div id='+roomName+'-'+other_user+'>\
						           <small id='+roomName+'-'+other_user+'-'+last_message_timestamp +'-'+last_message+' class="text-muted"><b>'+other_user+'</b></small>\
						           <small id='+roomName+'-'+other_user+'-'+last_message_timestamp +'-'+last_message+' class="text-muted">'+last_message_timestamp+'</small>\
						           <small id='+roomName+'-'+other_user+'-'+last_message_timestamp +'-'+last_message+' class="text-muted">'+last_message+'</small>\
								</div>';
					}
					else
					{
						temp = '<div id='+roomName+'-'+other_user+'>\
						           <small id='+roomName+'-'+other_user+'-'+last_message_timestamp+'-'+last_message+' class="text-muted">'+other_user+'</small>\
						           <small id='+roomName+'-'+other_user+'-'+last_message_timestamp+'-'+last_message+' class="text-muted">'+last_message_timestamp+'</small>\
						           <small id='+roomName+'-'+other_user+'-'+last_message_timestamp+'-'+last_message+' class="text-muted">'+last_message+'</small>\
								</div>';
					}
			      	
					temp_all_chats += temp;
			    });
			    $('#idAllChatsCumTicket').html(temp_all_chats);
			    // console.log(temp_all_chats);
		     });
			}
			else{
				$('#idAllChatsCumTicket').html("");
				isTicketForm = "True";
			}
			
		});

        $('#idAllChatsCumTicket').click(function(e){
        	// this gives the room id and sender name
        	console.log(e.target.id);
        	let room_sender = e.target.id.split('-');
        	let room_id = room_sender[0];
        	let other_user = room_sender[1];
        	let last_message_timestamp = room_sender[2];
        	let last_message = room_sender[3];
        	let this_user = $('#hidden-this-username').val();
        	active_room = room_id;
        	// to ensure that correct room has opened and not "000" room
        	roomName = room_id;
        	// homework for hiding all chats
        	$('#idAllChatsCumTicket').html("");
			isTicketForm = "True";
			// update the seen status of the clicked chat
			if(isNaN(active_room))
				return;
			allChatsPerUser.child(this_user).child(active_room).set({
				unread_message_count: 0,
				last_message: last_message,
				other_user: g_other_user,
				last_message_timestamp: last_message_timestamp
			});
			// allChatsPerUser.child(this_user).child(active_room).on('value', )
        	openForm_with_roomId(room_id, this_user, other_user);
        });

        //update the count of unread messages
        allChatsPerUser.child($('#hidden-this-username').val()).on('value', snapshot => {
			    // console.log(snapshot.val());
			    let unread_chat_count=0;
			    snapshot.forEach((messageSnapshot) => {
			    	let unread_message_count = messageSnapshot.val().unread_message_count;
			      	// console.log(sender, last_message);
			      	if(parseInt(unread_message_count) > 0)
					{	
						unread_chat_count += 1;
					}
			    });
			    if(unread_chat_count > 0)
			    	$('#idCountUnreadChats').html(unread_chat_count+"");
				else
					$('#idCountUnreadChats').html("");
			    // console.log(temp_all_chats);
		});
		
});