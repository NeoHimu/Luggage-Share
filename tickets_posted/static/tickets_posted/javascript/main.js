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
	is_user_loggedin = $('#is-user-loggedin').text()
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
	is_user_loggedin = $('#is-user-loggedin').text()
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


        $('#idCloseChatButton').on('click', closeForm);
        $('#chat-message-submit').on('click', sendMessage);

	    function openForm(first, second, this_user, other_user) {
	    	number_of_messages_to_load = 30;
	    	g_this_user = this_user;
	    	g_other_user = other_user;
	      // console.log(other_user);
	      first = parseInt(first);
	      second = parseInt(second);
		  if(first < second)
		  	roomName = first*1000000000000+second;
		  else
		  	roomName = second*1000000000000+first;
		  console.log(roomName);
		  document.getElementById("other-user").innerHTML = other_user;
		  document.getElementById("myForm").style.display = "block";

		    // load all previous messages
		    let chat = document.getElementById('chat-log');
		    let str = Object.assign("", chat.innerHTML);
		    chat.innerHTML = "";
		    // check if roomName exists na
        	allRooms.child(roomName).orderByKey().limitToLast(number_of_messages_to_load).on('value', snapshot => {
			    // console.log(snapshot.val());
			    let str_temp="";
			    console.log(number_of_messages_to_load);
			    snapshot.forEach((messageSnapshot) => {
			      // console.log(messageSnapshot.key);
			      // console.log(messageSnapshot.val().message);
			      // console.log("loop length");
			      if(messageSnapshot.val().sender === this_user)
			      	str_temp += '<div align="right"><span style="background: #96b5e0; border-color: #e1eaf7;  border-radius: 25px;">'+messageSnapshot.val().message+'</span></div>';
			      else
			      	str_temp += '<div align="left"><span style="border-color: #e1eaf7;  border-radius: 25px;">'+messageSnapshot.val().message+'</span></div>';
			    
			        allChatsPerUser.child(g_this_user).child(g_other_user).set({
				        last_message: messageSnapshot.val().message,
				        room_id: roomName,
				        last_message_timestamp: "12:34",
				        last_seen: "4 minutes ago",
				    });
			    });

			    chat.innerHTML = str_temp;
			    //scroll to bottom of the chat
			    var e = document.getElementById('div-messages');
				e.scrollTop = e.scrollHeight;
			    // console.log(str_temp);
		  });
		}

		function openForm_with_roomId(room_id, this_user, other_user) {
	    	number_of_messages_to_load = 30;
	    	g_this_user = this_user;
	    	g_other_user = other_user;
	      // console.log(other_user);
	      roomName = room_id;
		  console.log(roomName);
		  document.getElementById("other-user").innerHTML = other_user;
		  document.getElementById("myForm").style.display = "block";

		    // load all previous messages
		    let chat = document.getElementById('chat-log');
		    let str = Object.assign("", chat.innerHTML);
		    chat.innerHTML = "";
		    // check if roomName exists na
        	allRooms.child(roomName).orderByKey().limitToLast(number_of_messages_to_load).on('value', snapshot => {
			    // console.log(snapshot.val());
			    let str_temp="";
			    console.log(number_of_messages_to_load);
			    snapshot.forEach((messageSnapshot) => {
			      // console.log(messageSnapshot.key);
			      // console.log(messageSnapshot.val().message);
			      // console.log("loop length");
			      if(messageSnapshot.val().sender === this_user)
			      	str_temp += '<div align="right"><span style="background: #96b5e0; border-color: #e1eaf7;  border-radius: 25px;">'+messageSnapshot.val().message+'</span></div>';
			      else
			      	str_temp += '<div align="left"><span style="border-color: #e1eaf7;  border-radius: 25px;">'+messageSnapshot.val().message+'</span></div>';
			    
			        allChatsPerUser.child(g_this_user).child(g_other_user).set({
				        last_message: messageSnapshot.val().message,
				        room_id: roomName,
				        last_message_timestamp: "12:34",
				        last_seen: "4 minutes ago",
				    });
			    });

			    chat.innerHTML = str_temp;
			    //scroll to bottom of the chat
			    var e = document.getElementById('div-messages');
				e.scrollTop = e.scrollHeight;
			    // console.log(str_temp);
		  });
		}


		function closeForm() {
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
        	console.log(g_other_user);
        }

        $('#div-all-chats').click(function() {
			// console.log("hello world!");
			// console.log($('#hidden-this-username').val());
			// console.log($('#hidden-this-userid').val());

			allChatsPerUser.child($('#hidden-this-username').val()).orderByKey().limitToLast(10).on('value', snapshot => {
			    // console.log(snapshot.val());
			    temp_all_chats = "";
			    snapshot.forEach((messageSnapshot) => {
			    	let sender = messageSnapshot.key;
			    	let last_message = messageSnapshot.val().last_message;
			    	let last_message_timestamp = messageSnapshot.val().last_message_timestamp;
			    	let room_id = messageSnapshot.val().room_id;
			      	// console.log(sender, last_message);
			      	temp_all_chats +=
			      	'<div id='+room_id+'-'+sender+'>\
						      <small id='+room_id+'-'+sender+' class="text-muted">'+sender+'</small>\
						      <small id='+room_id+'-'+sender+' class="text-muted">'+last_message_timestamp+'</small>\
						    <small id='+room_id+'-'+sender+' class="text-muted">'+last_message+'</small>\
					</div>';
			    });
			    $('#idAllChatsCumTicket').html(temp_all_chats);
			    // console.log(temp_all_chats);
		    });
		});


        $('#idAllChatsCumTicket').click(function(e){
        	// this gives the room id and sender name
        	console.log(e.target.id);
        	let room_sender = e.target.id.split('-');
        	let room_id = room_sender[0];
        	let other_user = room_sender[1];
        	let this_user = $('#hidden-this-username').val();

        	openForm_with_roomId(room_id, this_user, other_user);

        });

});