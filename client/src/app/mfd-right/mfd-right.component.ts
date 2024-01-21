import { Component, OnDestroy, OnInit } from '@angular/core';
import * as aircraftProfile from '../Profiles/P51D.json';
import * as commonData from '../Profiles/Common.json';
import ExportDataParser from '../ExportDataParser';
import { AircraftDevice, TrackedDevice, Line } from '../TrackedDevice';
import { DcsClientService } from '../dcsclient.service';

@Component({
  selector: 'app-mfd-right',
  templateUrl: './mfd-right.component.html',
  styleUrls: ['./mfd-right.component.css']
})
export class MfdRightComponent implements OnInit {
  title = 'MfdDisplay';

  lineLen = 200;
  interval = 2;
  aircraftName = 'No Aircraft';

  centerX = 150;
  centerY = 150;
  radius = 100;
  segLen = 10;
  value = 1300;
  segementCount = 12;
  manifoldPressure = 0;
  rpmValue = 16;
  altitude = 0;
  heading = 0;
  ias = 0;
  segments: Line[] = [];

  oilTemperature = 0;
  oilPressure = 0;
  fuelPressure = 0;

  carbTemperature = 0;
  coolantTemperature = 0;

  climbRate = 0;

  battery: string;
  generator: string;

  fuelLeft = 0;
  fuelRight = 0;

  slip = 0;
  turn = 0;

constructor(protected dcsClient: DcsClientService) {

}
  ngOnInit(): void {
    this.dcsClient.registerListener('Metadata', '_ACFT_NAME', (value) => { this.aircraftName = value; });

    this.dcsClient.registerListener('Turn Indicator', 'SLIPBALL', (value) => { this.slip = (value - 32767) / 10000; });
    this.dcsClient.registerListener('Turn Indicator', 'TURN_INDICATOR', (value) => { this.turn = (value - 32767) / 10000; });

    this.dcsClient.registerListener('Variometer', 'VARIOMETER_VVI', (value) => { this.climbRate = (value - 32767) / 10000; });

    this.dcsClient.registerListener('Gauge Values', 'ALTIMETER_VALUE', (value) => { this.altitude = value; });
    this.dcsClient.registerListener('Gauge Values', 'HEADING_VALUE', (value) => { this.heading = value; });
    this.dcsClient.registerListener('Gauge Values', 'AIRSPEED_MPH_VALUE', (value) => { this.ias = value; });
    this.dcsClient.registerListener('Gauge Values', 'MANIFOLD_PRESSURE_VALUE', (value) => { this.manifoldPressure = value; });
    this.dcsClient.registerListener('Gauge Values', 'ENGINE_RPM_VALUE', (value) => { this.rpmValue = value / 100.0; });
    this.dcsClient.registerListener('Gauge Values', 'OIL_PRESSURE_VALUE', (value) => { this.oilPressure = value; });
    this.dcsClient.registerListener('Gauge Values', 'OIL_TEMPERATURE_VALUE', (value) => { this.oilTemperature = value; });
    this.dcsClient.registerListener('Gauge Values', 'FUEL_PRESSURE_VALUE', (value) => { this.fuelPressure = value; });

    this.dcsClient.registerListener('Engine System', 'OIL_TEMPERATURE_VALUE', (value) => { this.oilTemperature = value; });
    this.dcsClient.registerListener('Gauge Values', 'FUEL_PRESSURE_VALUE', (value) => { this.fuelPressure = value; });

    this.dcsClient.registerListener('Light System', 'LANDING_GEAR_GREEN', (value) => { });
    this.dcsClient.registerListener('Light System', 'LANDING_GEAR_RED', (value) => { });
    this.dcsClient.registerListener('Electric System', 'AMMETER', (value) => { });



    this.dcsClient.registerListener('Engine System', 'CARB_TEMP', (value) => { this.carbTemperature = value / 1000.0; });
    this.dcsClient.registerListener('Engine System', 'COOLANT_TEMP', (value) => { this.coolantTemperature = value / 1000.0; });

    this.dcsClient.registerListener('Fuel System', 'FUEL_TANK_FUSELAGE', (value) => { });
    this.dcsClient.registerListener('Fuel System', 'FUEL_TANK_LEFT', (value) => { this.fuelLeft = value / 566; });
    this.dcsClient.registerListener('Fuel System', 'FUEL_TANK_RIGHT', (value) => { this.fuelRight = value / 566; });
  }
}
