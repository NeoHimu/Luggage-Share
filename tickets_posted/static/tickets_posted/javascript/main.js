const user_input_departure = $("#departure-airport")
const user_input_arrival = $("#arrival-airport")
const search_icon = $('#search-icon')
const airports_div_departure = $('#departure-airport-search-result') 
const airports_div_arrival = $('#arrival-airport-search-result') 
const demanded_users = $('#demanded-users')
const endpoint_departure = '/airports_departure/' 
const endpoint_arrival = '/airports_arrival/' 

const delay_by_in_ms = 700
let scheduled_function = false

$(document).on('submit', '#ticket-info-form', function(e){
	e.preventDefault(); // this prevents from refreshing the page

	$.ajax({
			url: '/create/new/ticket/', //ajax call will be made to this url
			type: 'post',
			data:{
				arrival_airport:$('#arrival-airport').val(),
				flight_number:$('#flight-number').val(),
				date:$('#departure-date').val(),
				time:$('#departure-time').val(),
				is_giver:$('#is-giver').val(),
				csrfmiddlewaretoken: $('input[name=csrfmiddlewaretoken]').val(),
			},
			dataType: "json",
			success: function(response){
				// alert("Successful!");
				$("#ticket-info-form").trigger('reset');//clear the form
				demanded_users.html(response['html_from_view'])

			}
		});
});
// let ajax_call_departure = function (endpoint_departure, request_parameters) {
// 	$.getJSON(endpoint_departure, request_parameters)
// 		.done(response => {
// 			// fade out the airports_div, then:
// 			airports_div_departure.fadeTo('slow', 0).promise().then(() => {
// 				// replace the HTML contents
// 				airports_div_departure.html(response['html_from_view'])
// 				// fade-in the div with new contents
// 				airports_div_departure.fadeTo('slow', 1)
// 				// stop animating search icon
// 				search_icon.removeClass('blink')
// 			})
// 		})
// }


// user_input_departure.on('keyup', function () {

// 	const request_parameters = {
// 		q: $(this).val() // value of user_input: the HTML element with ID user-input
// 	}

// 	// start animating the search icon with the CSS class
// 	search_icon.addClass('blink')

// 	// if scheduled_function is NOT false, cancel the execution of the function
// 	if (scheduled_function) {
// 		clearTimeout(scheduled_function)
// 	}

// 	// setTimeout returns the ID of the function to be executed
// 	scheduled_function = setTimeout(ajax_call_departure, delay_by_in_ms, endpoint_departure, request_parameters)
// })


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


user_input_arrival.on('keyup', function () {

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
	scheduled_function = setTimeout(ajax_call_arrival, delay_by_in_ms, endpoint_arrival, request_parameters)
})
