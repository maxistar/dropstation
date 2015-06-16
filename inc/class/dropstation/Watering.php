<?
namespace dropstation;

use \etherra\Db;

class Watering {
    const LINE_SEPARATOR = "\r\n";
    function show(){
        $deviceId = $_GET['device'];
        $res = Db::execute("select id, user_id from devices where device_key=?", $deviceId);
        //$device = dropstation\model\Device::getItem($deviceId);
        if ($res->eof) return $this->formatError('Device not found');
        list($deviceId, $userId) = $res->fetch();
        
        Db::execute("update devices SET last_access=now() where id=?", $deviceId);

        //get users timezone
        $res = Db::execute("select timezone from users where id=?", $userId);
        if ($res->eof) return $this->formatError('User not found');
        list ($timezone) = $res->fetch();

        //get list of watering points for device
        $res = Db::execute("select id, capacity_id, unix_timestamp(last_watering), watering_value, watering_hour
            from points where device_id=? order by num", $deviceId);

        $results = array();
        $needsWatering = false;
        $counter = 0;
        while($row = $res->next()) {
            list($pointId, $capacityId, $lastWatering, $wateringValue, $wateringHour) = $row;
            //check if it passed more than 20 hours since last watering
            if (time() - $lastWatering < 20*60*60) {
                $results[$counter++] = 0; //no need watering passed less then 20 hours
                continue;
            }

            //check if the current hour is more then wateringHour for device
            $currentHour = $this->getCurrentHourForUser($timezone);
            if ($currentHour < $wateringHour) {
                $results[$counter++] = 0; //no need to water yet
                continue;
            }

            $results[$counter++] = $wateringValue;
            //update point
            Db::execute("update points set last_watering=now() where id=?", $pointId);

            //update capacitor
            Db::execute("update capacitors set value = value-? where id=?", $wateringValue, $capacityId);

            //store event
            Db::execute("insert into events SET point_id=?, time=now(), amount=?, event_type='watering'", $pointId, $wateringValue);

            $needsWatering = true;
        }
        if ($needsWatering) return $this->formatResults($results);
        $this->formatNothing();
    }

    function getCurrentHourForUser($timezone) {
        $timezoneOld = date_default_timezone_get();
        date_default_timezone_set($timezone);
        $hour = date('G');
        date_default_timezone_set($timezoneOld);
        return $hour;
    }

    function formatNothing(){
        echo 'nothing';
    }

    function formatError($message){
        echo "error" . self::LINE_SEPARATOR . $message;
    }

    function formatResults($results){
        echo "watering";
        foreach($results as $r){
            echo self::LINE_SEPARATOR;
            print $r;
        }
    }
}
