import java.io.FileNotFoundException;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.MalformedInputException;
import com.google.gson.*;
import java.util.List;
import java.util.ArrayList;
import java.util.Formatter;
import java.io.FileWriter;

public class ControllingClass {
	private List<FoodTruck> foodtrucks = new ArrayList<>();
	
	private Formatter output = null;
	
	public static void main(String [] args)
	{
		
		ControllingClass classObj = new ControllingClass();
		
		classObj.getJsonResponse("0");
		classObj.getJsonResponse("20");
		classObj.getJsonResponse("40");
		classObj.getJsonResponse("60");
		classObj.getJsonResponse("80");
		classObj.displayFoodTrucks();
		classObj.backToJson();		

}
	
	public void getJsonResponse(String start)
	{
		String builtQuery = "https://serpapi.com/search.json?engine=google_local&start="+start+ "&q=food+truck&location=Downtown+Austin%2C+Texas%2C+United+States&google_domain=google.com&gl=us&hl=en&api_key=5859c81649339aa8a0ff62e78454e2c919824985c8a3604f79f0de4103b42813";
		
		try 
		{
            HttpClient client = HttpClient.newBuilder().build();
            HttpRequest request = HttpRequest.newBuilder()
            		.uri(URI.create(builtQuery))
                   .GET()
                   .build();
            HttpResponse<String> response;
            response = client.send(request, HttpResponse.BodyHandlers.ofString());
            String apiResponse = response.body();
            if (response.statusCode() != 200)
            {	
				throw new RuntimeException("Failed: HTTP request error code: " +
						response.statusCode());
            }            
           
            JsonParser parser = new JsonParser();
            JsonObject topLevelObject = parser.parse(apiResponse).getAsJsonObject();
            JsonArray jsonArray = topLevelObject.getAsJsonArray("local_results"); // <<<< correct key here

            for (JsonElement el : jsonArray) {
                JsonObject obj = el.getAsJsonObject();

                String title = obj.get("title").getAsString();
                String type = obj.get("type").getAsString();
                JsonObject gps = obj.getAsJsonObject("gps_coordinates");
                String latitude = gps.get("latitude").getAsString();
                String longitude = gps.get("longitude").getAsString();
                
                FoodTruck truck = new FoodTruck(latitude, longitude, title, type);
                foodtrucks.add(truck);
            }

	}
		catch (InterruptedException exp1)
		{
			System.err.println("Response interrupted: ");
			System.err.println(exp1.toString());   
		}
		catch (MalformedInputException exp2)
		{
			System.err.println("Malformed response from request: ");
			System.err.println(exp2.toString());
		}
		catch (IOException exp3)
		{
			System.err.println("Input/Output issue detected: ");
			System.err.println(exp3.toString());
		}
}
	
	public void displayFoodTrucks()
	{
		System.out.println("Got to display.");
		 for (FoodTruck truck : foodtrucks) {
             System.out.println(truck);
         }
	}
	
	public void backToJson()
	{
		try {
			output = new Formatter("FoodTruckList.txt");
		}
		catch (FileNotFoundException e) 
	   	   {
	   	        System.err.println("Issue with creating output file.");
	   	        System.err.println(e.toString());
	   	   }
		Gson gson = new GsonBuilder().setPrettyPrinting().create();
		String prettyJson = gson.toJson(foodtrucks);
		//System.out.println(prettyJson);
		output.format(prettyJson);
		output.close();
		
		try (FileWriter writer = new FileWriter("data.json")) {
            writer.write(prettyJson);
            System.out.println("Successfully wrote JSON to file: data.json");
        } catch (IOException e) {
            System.err.println("Error writing to file: " + e.getMessage());
        }
	}
}
