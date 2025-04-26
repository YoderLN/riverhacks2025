
public class FoodTruck {

	String latitude;
	String longitude;
	String title;
	String type;
	
	public FoodTruck(String latitude, String longitude, String title, String type)
	{
		this.latitude = latitude;
		this.longitude = longitude;
		this.title = title;
		this.type = type;
	}
	
	@Override
	public String toString() {
		return String.format("%s %s%n%s %s%n%s %s%n%s %s", "latitude: ", latitude, 
				"longitude: ", longitude, 
				"Name: ", title, 
				"Type: ", type);
	}
}
