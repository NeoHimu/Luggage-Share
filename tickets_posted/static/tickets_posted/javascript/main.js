$(function(){

const user_input_departure = $("#departure-airport")
const user_input_arrival = $("#arrival-airport")
const search_icon = $('#search-icon') // this is the heading in h3 i.e. Ticket Info
const airports_div_departure = $('#departure-airport-search-result') 
const airports_div_arrival = $('#arrival-airport-search-result') 
const demanded_users = $('#demanded-users')
const endpoint_departure = '/airports_departure/' 
const endpoint_arrival = '/airports_arrival/' 

const delay_by_in_ms = 700
let scheduled_function = false

const divCurrentUserAllTickets = $('#divCurrentUserAllTickets');



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

	}, 300)); //adds delay of 300 ms

// user_input_arrival.on('keyup', function () {

// })


$("#currentUserTicketList li").click(function() {
   			// console.log(this.id);
   			// console.log($(this).find('#current-ticket-id').text());
   			$.ajax({
			url: '/find-all-matched-users/', //ajax call will be made to this url
			type: 'get',
			data:{
				ticket_id:$(this).find('#current-user-ticket-id').text(),
			},
			dataType: "json",
			success: function(response){
				// alert("Successful!");
				// console.log(response['html_from_view']);
				demanded_users.html(response['html_from_view']);
				divCurrentUserAllTickets.html("");

			}
		});
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



});