export default function PopunderAd() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(s,u,z,p){s.src=u,s.setAttribute('data-zone',z),p.appendChild(s);})(document.createElement('script'),'https://inklinkor.com/tag.min.js',5359282,document.body||document.documentElement)`,
      }}
    ></script>
  );
}
