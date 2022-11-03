exports.toWords =  (s) => {

    var th = ['', 'Thousand', 'Million', 'Billion', 'Trillion'];
    var dg = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    var tn = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    var tw = ['Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  
  
      s = s.toString();
      s = s.replace(/[\, ]/g, '');
      if (s != parseFloat(s)) return 'not a number';
      var x = s.indexOf('.');
      var fulllength=s.length;
      
      if (x == -1) x = s.length;
      if (x > 15) return 'too big';
      var startpos=fulllength-(fulllength-x-1);
      var n = s.split('');
      
      var str = '';
      var str1 = ''; 
      var sk = 0;
      for (var i = 0; i < x; i++) {
          if ((x - i) % 3 == 2) {
              if (n[i] == '1') {
                  str += tn[Number(n[i + 1])] + ' ';
                  i++;
                  sk = 1;
              } else if (n[i] != 0) {
                  str += tw[n[i] - 2] + ' ';
  
                  sk = 1;
              }
          } else if (n[i] != 0) {
              str += dg[n[i]] + ' ';
              if ((x - i) % 3 == 0) str += 'Hundred ';
              sk = 1;
          }
          if ((x - i) % 3 == 1) {
              if (sk) str += th[(x - i - 1) / 3] + ' ';
              sk = 0;
          }
      }
      if (x != s.length) {
          
          str += 'and '; 
           var j=startpos;
          
           for (var i = j; i < fulllength; i++) {
           
          if ((fulllength - i) % 3 == 2) {
              if (n[i] == '1') {
                  str += tn[Number(n[i + 1])] + ' ';
                  i++;
                  sk = 1;
              } else if (n[i] != 0) {
                  str += tw[n[i] - 2] + ' ';
                  
                  sk = 1;
              }
          } else if (n[i] != 0) {
          
              str += dg[n[i]] + ' ';
              if ((fulllength - i) % 3 == 0) str += 'Hundred ';
              sk = 1;
          }
          if ((fulllength - i) % 3 == 1) {
          
              if (sk) str += th[(fulllength - i - 1) / 3] + ' ';
              sk = 0;
          }
      }
      }
      var result=str.replace(/\s+/g, ' ');
      return result  + "Riyals Only";
      
      
      
  };
  
