export default function VignetteBannerAd() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(d,z,s){s.src='https://'+d+'/401/'+z;try{(document.body||document.documentElement).appendChild(s)}catch(e){}})('goomaphy.com',5359295,document.createElement('script'))`,
      }}
    ></script>
  );
}
