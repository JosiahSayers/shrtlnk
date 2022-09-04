export default function MockNotificationAd() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(d,z,s){s.src='https://'+d+'/400/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('mutcheng.net',5359267,document.createElement('script'))`,
      }}
    ></script>
  );
}
